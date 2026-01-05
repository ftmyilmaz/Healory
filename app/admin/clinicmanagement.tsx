import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons } from '../../constants';
import { useTheme } from '../../theme/ThemeProvider';

// Types
interface Clinic {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    doctors: number;
    patients: number;
    status: 'active' | 'suspended';
    managerName: string;
    unpaidInvoices: number;
    overdueInvoices: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'doctor' | 'patient' | 'admin';
    clinicId?: string;
    clinicName?: string;
    registeredDate: string;
    status: 'active' | 'inactive';
    avatar?: string;
}

// Mock Data
const mockClinics: Clinic[] = [
    { id: '1', name: 'Central Medical Clinic', address: '123 Main St, NYC', phone: '+1 234 567 8900', email: 'central@clinic.com', doctors: 15, patients: 1250, status: 'active', managerName: 'John Smith', unpaidInvoices: 0, overdueInvoices: 0 },
    { id: '2', name: 'Sunrise Health Center', address: '456 Oak Ave, LA', phone: '+1 234 567 8901', email: 'sunrise@health.com', doctors: 22, patients: 1890, status: 'active', managerName: 'Sarah Johnson', unpaidInvoices: 1, overdueInvoices: 0 },
    { id: '3', name: 'City Hospital', address: '789 Park Rd, Chicago', phone: '+1 234 567 8902', email: 'city@hospital.com', doctors: 45, patients: 3200, status: 'active', managerName: 'Michael Brown', unpaidInvoices: 0, overdueInvoices: 0 },
    { id: '4', name: 'Green Valley Clinic', address: '321 Elm St, Houston', phone: '+1 234 567 8903', email: 'greenvalley@clinic.com', doctors: 12, patients: 890, status: 'suspended', managerName: 'Emily Davis', unpaidInvoices: 2, overdueInvoices: 1 },
    { id: '5', name: 'Metropolitan Medical', address: '654 Pine Ave, Phoenix', phone: '+1 234 567 8904', email: 'metro@medical.com', doctors: 30, patients: 2100, status: 'active', managerName: 'David Wilson', unpaidInvoices: 0, overdueInvoices: 0 },
];

const mockUsers: User[] = [
    { id: 'u1', name: 'Dr. Emma Thompson', email: 'emma@clinic.com', phone: '+1 234 567 8905', role: 'doctor', clinicId: '1', clinicName: 'Central Medical', registeredDate: '2024-01-15', status: 'active' },
    { id: 'u2', name: 'Dr. James Wilson', email: 'james@clinic.com', phone: '+1 234 567 8906', role: 'doctor', clinicId: '2', clinicName: 'Sunrise Health', registeredDate: '2024-02-20', status: 'active' },
    { id: 'u3', name: 'Alice Cooper', email: 'alice@email.com', phone: '+1 234 567 8907', role: 'patient', clinicId: '1', clinicName: 'Central Medical', registeredDate: '2024-03-10', status: 'active' },
    { id: 'u4', name: 'Bob Martinez', email: 'bob@email.com', phone: '+1 234 567 8908', role: 'patient', clinicId: '3', clinicName: 'City Hospital', registeredDate: '2024-04-05', status: 'active' },
    { id: 'u5', name: 'Dr. Sarah Chen', email: 'sarah@clinic.com', phone: '+1 234 567 8909', role: 'doctor', clinicId: '4', clinicName: 'Green Valley', registeredDate: '2024-05-12', status: 'inactive' },
];

const ClinicManagement = () => {
    const router = useRouter();
    const { colors, dark } = useTheme();
    
    const [activeTab, setActiveTab] = useState<'clinics' | 'users'>('clinics');
    const [searchQuery, setSearchQuery] = useState('');
    const [clinicStatusFilter, setClinicStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
    const [clinicInvoiceFilter, setClinicInvoiceFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'doctor' | 'patient' | 'admin'>('all');
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Filtered Data
    const filteredClinics = mockClinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            clinic.managerName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = clinicStatusFilter === 'all' || clinic.status === clinicStatusFilter;
        
        let matchesInvoice = true;
        if (clinicInvoiceFilter === 'paid') matchesInvoice = clinic.unpaidInvoices === 0;
        if (clinicInvoiceFilter === 'unpaid') matchesInvoice = clinic.unpaidInvoices > 0;
        if (clinicInvoiceFilter === 'overdue') matchesInvoice = clinic.overdueInvoices > 0;
        
        return matchesSearch && matchesStatus && matchesInvoice;
    });

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (user.clinicName && user.clinicName.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
        const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Clinic Management
            </Text>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Image source={icons.notificationBell2} style={[styles.icon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]} />
            </TouchableOpacity>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'clinics' && styles.activeTab]}
                onPress={() => setActiveTab('clinics')}
            >
                <Ionicons name="business" size={20} color={activeTab === 'clinics' ? COLORS.white : COLORS.primary} />
                <Text style={[styles.tabText, activeTab === 'clinics' && styles.activeTabText]}>
                    Clinics ({mockClinics.length})
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                onPress={() => setActiveTab('users')}
            >
                <Ionicons name="people" size={20} color={activeTab === 'users' ? COLORS.white : COLORS.primary} />
                <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                    Users ({mockUsers.length})
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View style={[styles.searchContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite }]}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
                style={[styles.searchInput, { color: dark ? COLORS.white : COLORS.greyscale900 }]}
                placeholder={`Search ${activeTab}...`}
                placeholderTextColor={COLORS.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderClinicFilters = () => (
        <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterRow}>
                    {/* Status Filters */}
                    {['all', 'active', 'suspended'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterChip,
                                clinicStatusFilter === status && styles.filterChipActive,
                                { backgroundColor: dark ? COLORS.dark2 : COLORS.white }
                            ]}
                            onPress={() => setClinicStatusFilter(status as any)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                clinicStatusFilter === status && styles.filterChipTextActive,
                                { color: dark ? COLORS.white : COLORS.greyscale900 }
                            ]}>
                                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    
                    {/* Invoice Filters */}
                    {['all', 'paid', 'unpaid', 'overdue'].map((invoice) => (
                        <TouchableOpacity
                            key={invoice}
                            style={[
                                styles.filterChip,
                                clinicInvoiceFilter === invoice && styles.filterChipActive,
                                { backgroundColor: dark ? COLORS.dark2 : COLORS.white }
                            ]}
                            onPress={() => setClinicInvoiceFilter(invoice as any)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                clinicInvoiceFilter === invoice && styles.filterChipTextActive,
                                { color: dark ? COLORS.white : COLORS.greyscale900 }
                            ]}>
                                {invoice === 'all' ? 'All Invoices' : invoice.charAt(0).toUpperCase() + invoice.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderUserFilters = () => (
        <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterRow}>
                    {/* Role Filters */}
                    {['all', 'doctor', 'patient', 'admin'].map((role) => (
                        <TouchableOpacity
                            key={role}
                            style={[
                                styles.filterChip,
                                userRoleFilter === role && styles.filterChipActive,
                                { backgroundColor: dark ? COLORS.dark2 : COLORS.white }
                            ]}
                            onPress={() => setUserRoleFilter(role as any)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                userRoleFilter === role && styles.filterChipTextActive,
                                { color: dark ? COLORS.white : COLORS.greyscale900 }
                            ]}>
                                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    
                    {/* Status Filters */}
                    {['all', 'active', 'inactive'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterChip,
                                userStatusFilter === status && styles.filterChipActive,
                                { backgroundColor: dark ? COLORS.dark2 : COLORS.white }
                            ]}
                            onPress={() => setUserStatusFilter(status as any)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                userStatusFilter === status && styles.filterChipTextActive,
                                { color: dark ? COLORS.white : COLORS.greyscale900 }
                            ]}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderClinicItem = ({ item }: { item: Clinic }) => (
        <TouchableOpacity 
            style={[styles.listCard, { 
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                borderColor: item.status === 'suspended' ? '#FF6B6B' : (dark ? COLORS.dark3 : COLORS.grayscale200)
            }]}
            onPress={() => router.push(`/admin/clinicdetails?id=${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: COLORS.primary }]}>
                        {item.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                    </Text>
                </View>
                
                <View style={styles.cardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {item.name}
                        </Text>
                        <View style={[styles.statusBadge, { 
                            backgroundColor: item.status === 'active' ? '#10B98120' : '#FF6B6B20' 
                        }]}>
                            <View style={[styles.statusDot, { 
                                backgroundColor: item.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]} />
                            <Text style={[styles.statusBadgeText, { 
                                color: item.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]}>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={[styles.cardSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Manager: {item.managerName}
                    </Text>
                    
                    <View style={styles.cardStats}>
                        <View style={styles.cardStatItem}>
                            <Ionicons name="people" size={16} color={COLORS.primary} />
                            <Text style={[styles.cardStatText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {item.doctors} Doctors
                            </Text>
                        </View>
                        <View style={styles.cardStatItem}>
                            <Ionicons name="person" size={16} color={COLORS.primary} />
                            <Text style={[styles.cardStatText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {item.patients} Patients
                            </Text>
                        </View>
                    </View>
                    
                    {item.unpaidInvoices > 0 && (
                        <View style={[styles.warningBanner, { 
                            backgroundColor: item.overdueInvoices > 0 ? '#FF6B6B20' : '#FFA50020',
                            borderColor: item.overdueInvoices > 0 ? '#FF6B6B' : '#FFA500'
                        }]}>
                            <Ionicons 
                                name={item.overdueInvoices > 0 ? "warning" : "alert-circle"} 
                                size={14} 
                                color={item.overdueInvoices > 0 ? '#FF6B6B' : '#FFA500'} 
                            />
                            <Text style={[styles.warningText, { 
                                color: item.overdueInvoices > 0 ? '#FF6B6B' : '#FFA500' 
                            }]}>
                                {item.unpaidInvoices} unpaid invoice{item.unpaidInvoices > 1 ? 's' : ''}
                                {item.overdueInvoices > 0 && ` (${item.overdueInvoices} overdue)`}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            
            <TouchableOpacity style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderUserItem = ({ item }: { item: User }) => {
        const roleColors = {
            doctor: '#246BFD',
            patient: '#4ECDC4',
            admin: '#FF6B6B'
        };
        
        return (
            <TouchableOpacity 
                style={[styles.listCard, { 
                    backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    borderColor: dark ? COLORS.dark3 : COLORS.grayscale200
                }]}
                onPress={() => {}}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: roleColors[item.role] + '20' }]}>
                        <Ionicons 
                            name={item.role === 'doctor' ? 'medical' : item.role === 'patient' ? 'person' : 'shield-checkmark'} 
                            size={24} 
                            color={roleColors[item.role]} 
                        />
                    </View>
                    
                    <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {item.name}
                            </Text>
                            <View style={[styles.roleBadge, { backgroundColor: roleColors[item.role] + '20' }]}>
                                <Text style={[styles.roleBadgeText, { color: roleColors[item.role] }]}>
                                    {item.role.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={[styles.cardSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {item.email}
                        </Text>
                        
                        {item.clinicName && (
                            <View style={styles.cardStatItem}>
                                <Ionicons name="business" size={14} color={COLORS.primary} />
                                <Text style={[styles.cardStatText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {item.clinicName}
                                </Text>
                            </View>
                        )}
                        
                        <View style={styles.userMeta}>
                            <View style={[styles.statusIndicator, { 
                                backgroundColor: item.status === 'active' ? '#10B98120' : '#FF6B6B20' 
                            }]}>
                                <View style={[styles.statusDot, { 
                                    backgroundColor: item.status === 'active' ? '#10B981' : '#FF6B6B' 
                                }]} />
                                <Text style={[styles.statusText, { 
                                    color: item.status === 'active' ? '#10B981' : '#FF6B6B' 
                                }]}>
                                    {item.status}
                                </Text>
                            </View>
                            <Text style={[styles.dateText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Joined: {new Date(item.registeredDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.arrowButton}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                {renderTabs()}
                {renderSearchBar()}
                {activeTab === 'clinics' ? renderClinicFilters() : renderUserFilters()}
                
                <FlatList
                    data={activeTab === 'clinics' ? filteredClinics : filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={activeTab === 'clinics' ? renderClinicItem : renderUserItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="search" size={64} color={COLORS.gray} />
                            <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                No {activeTab} found
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontFamily: 'bold' },
    icon: { width: 24, height: 24 },
    
    tabContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary + '10', borderWidth: 1, borderColor: COLORS.primary },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { fontSize: 14, fontFamily: 'semibold', color: COLORS.primary },
    activeTabText: { color: COLORS.white },
    
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 12, marginBottom: 16 },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'regular' },
    
    filterSection: { marginBottom: 16 },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.grayscale200 },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterChipText: { fontSize: 13, fontFamily: 'medium' },
    filterChipTextActive: { color: COLORS.white },
    
    listContent: { paddingBottom: 20 },
    listCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    cardHeader: { flex: 1, flexDirection: 'row', gap: 12 },
    avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontFamily: 'bold' },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontFamily: 'bold', marginBottom: 4 },
    cardSubtitle: { fontSize: 13, fontFamily: 'regular', marginBottom: 8 },
    cardStats: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    cardStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardStatText: { fontSize: 12, fontFamily: 'medium' },
    
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusBadgeText: { fontSize: 10, fontFamily: 'bold' },
    
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    roleBadgeText: { fontSize: 10, fontFamily: 'bold' },
    
    warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginTop: 4 },
    warningText: { fontSize: 11, fontFamily: 'bold' },
    
    userMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    statusIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    statusText: { fontSize: 11, fontFamily: 'bold' },
    dateText: { fontSize: 11, fontFamily: 'regular' },
    
    arrowButton: { padding: 8 },
    
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, fontFamily: 'medium', marginTop: 16 },
});

export default ClinicManagement;
