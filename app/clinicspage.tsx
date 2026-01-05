import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'doctor' | 'patient' | 'clinic_manager';
    clinicId?: string;
    status: 'active' | 'suspended';
    registeredDate: string;
    lastLogin?: string;
}

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
    registeredDate: string;
}

const mockClinics: Clinic[] = [
    { id: '1', name: 'Central Medical Clinic', address: '123 Main Street, New York', phone: '+1 234 567 8900', email: 'central@clinic.com', doctors: 15, patients: 1250, status: 'active', managerName: 'John Smith', registeredDate: '2025-01-15' },
    { id: '2', name: 'Sunrise Health Center', address: '456 Oak Avenue, Los Angeles', phone: '+1 234 567 8901', email: 'sunrise@health.com', doctors: 22, patients: 1890, status: 'active', managerName: 'Sarah Johnson', registeredDate: '2025-02-10' },
    { id: '3', name: 'City Hospital', address: '789 Park Road, Chicago', phone: '+1 234 567 8902', email: 'city@hospital.com', doctors: 45, patients: 3200, status: 'active', managerName: 'Michael Brown', registeredDate: '2025-03-05' },
    { id: '4', name: 'Green Valley Clinic', address: '321 Elm Street, Houston', phone: '+1 234 567 8903', email: 'greenvalley@clinic.com', doctors: 12, patients: 890, status: 'suspended', managerName: 'Emily Davis', registeredDate: '2024-12-20' },
    { id: '5', name: 'Metropolitan Medical', address: '654 Pine Avenue, Phoenix', phone: '+1 234 567 8904', email: 'metro@medical.com', doctors: 30, patients: 2100, status: 'active', managerName: 'David Wilson', registeredDate: '2025-01-25' },
];

const mockUsers: User[] = [
    { id: 'U1', name: 'John Smith', email: 'john@clinic.com', phone: '+1 234 567 8900', role: 'clinic_manager', clinicId: '1', status: 'active', registeredDate: '2025-01-15', lastLogin: '2026-01-04' },
    { id: 'U2', name: 'Dr. Emily Brown', email: 'emily@clinic.com', phone: '+1 234 567 8901', role: 'doctor', clinicId: '1', status: 'active', registeredDate: '2025-01-20', lastLogin: '2026-01-04' },
    { id: 'U3', name: 'Sarah Johnson', email: 'sarah@health.com', phone: '+1 234 567 8902', role: 'clinic_manager', clinicId: '2', status: 'active', registeredDate: '2025-02-10', lastLogin: '2026-01-03' },
    { id: 'U4', name: 'Michael Brown', email: 'michael@hospital.com', phone: '+1 234 567 8903', role: 'clinic_manager', clinicId: '3', status: 'active', registeredDate: '2025-03-05', lastLogin: '2026-01-04' },
    { id: 'U5', name: 'Emily Davis', email: 'emily@greenvalley.com', phone: '+1 234 567 8904', role: 'clinic_manager', clinicId: '4', status: 'suspended', registeredDate: '2024-12-20', lastLogin: '2025-12-15' },
    { id: 'U6', name: 'David Wilson', email: 'david@metro.com', phone: '+1 234 567 8905', role: 'clinic_manager', clinicId: '5', status: 'active', registeredDate: '2025-01-25', lastLogin: '2026-01-04' },
    { id: 'U7', name: 'Dr. Lisa Anderson', email: 'lisa@hospital.com', phone: '+1 234 567 8906', role: 'doctor', clinicId: '3', status: 'active', registeredDate: '2025-03-10', lastLogin: '2026-01-04' },
    { id: 'U8', name: 'Admin User', email: 'admin@healory.com', phone: '+1 234 567 8907', role: 'admin', status: 'active', registeredDate: '2024-01-01', lastLogin: '2026-01-04' },
];

const ClinicsPage = () => {
    const router = useRouter();
    const { colors, dark } = useTheme();
    
    const [activeTab, setActiveTab] = useState<'clinics' | 'users'>('clinics');
    const [searchQuery, setSearchQuery] = useState('');
    const [clinicStatusFilter, setClinicStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'doctor' | 'patient' | 'clinic_manager'>('all');
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

    const filteredClinics = mockClinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            clinic.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = clinicStatusFilter === 'all' || clinic.status === clinicStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
        const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const renderClinicFilters = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {(['all', 'active', 'suspended'] as const).map((status) => (
                <TouchableOpacity
                    key={status}
                    style={[
                        styles.filterChip,
                        { backgroundColor: clinicStatusFilter === status ? COLORS.primary : (dark ? COLORS.dark2 : COLORS.white) },
                        { borderColor: clinicStatusFilter === status ? COLORS.primary : (dark ? COLORS.dark3 : COLORS.grayscale200) }
                    ]}
                    onPress={() => setClinicStatusFilter(status)}
                >
                    <Text style={[
                        styles.filterChipText,
                        { color: clinicStatusFilter === status ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                    ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderUserFilters = () => (
        <View>
            <Text style={[styles.filterLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                {(['all', 'admin', 'clinic_manager', 'doctor', 'patient'] as const).map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.filterChip,
                            { backgroundColor: userRoleFilter === role ? COLORS.primary : (dark ? COLORS.dark2 : COLORS.white) },
                            { borderColor: userRoleFilter === role ? COLORS.primary : (dark ? COLORS.dark3 : COLORS.grayscale200) }
                        ]}
                        onPress={() => setUserRoleFilter(role)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            { color: userRoleFilter === role ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                        ]}>
                            {role === 'clinic_manager' ? 'Manager' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <Text style={[styles.filterLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray, marginTop: 12 }]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                {(['all', 'active', 'suspended'] as const).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterChip,
                            { backgroundColor: userStatusFilter === status ? COLORS.primary : (dark ? COLORS.dark2 : COLORS.white) },
                            { borderColor: userStatusFilter === status ? COLORS.primary : (dark ? COLORS.dark3 : COLORS.grayscale200) }
                        ]}
                        onPress={() => setUserStatusFilter(status)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            { color: userStatusFilter === status ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                        ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderClinicCard = ({ item }: { item: Clinic }) => (
        <TouchableOpacity 
            style={[styles.card, { 
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                borderColor: item.status === 'suspended' ? '#FF6B6B' : (dark ? COLORS.dark3 : COLORS.grayscale200),
                borderWidth: item.status === 'suspended' ? 2 : 1
            }]}
            onPress={() => router.push(`/clinicdetails?id=${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        {item.address}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { 
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
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Manager: {item.managerName}
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="call-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        {item.phone}
                    </Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {item.doctors}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Doctors
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {item.patients}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Patients
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderUserCard = ({ item }: { item: User }) => {
        const roleColors = {
            admin: '#FF6B6B',
            clinic_manager: '#4ECDC4',
            doctor: COLORS.primary,
            patient: '#FFD93D'
        };

        const roleIcons = {
            admin: 'shield-checkmark',
            clinic_manager: 'briefcase',
            doctor: 'medical',
            patient: 'person'
        };

        return (
            <TouchableOpacity 
                style={[styles.card, { 
                    backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
                    borderWidth: 1
                }]}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {item.name}
                            </Text>
                            <View style={[styles.roleBadge, { backgroundColor: roleColors[item.role] + '20' }]}>
                                <Ionicons name={roleIcons[item.role] as any} size={12} color={roleColors[item.role]} />
                                <Text style={[styles.roleText, { color: roleColors[item.role] }]}>
                                    {item.role === 'clinic_manager' ? 'Manager' : item.role}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.cardSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {item.email}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { 
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
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="call-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                        <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {item.phone}
                        </Text>
                    </View>
                    {item.lastLogin && (
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                            <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Last login: {new Date(item.lastLogin).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>

                {item.clinicId && (
                    <View style={[styles.clinicTag, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale100 }]}>
                        <Ionicons name="business-outline" size={14} color={COLORS.primary} />
                        <Text style={[styles.clinicTagText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            Clinic ID: {item.clinicId}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Management" />
                
                {/* Tabs */}
                <View style={[styles.tabContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'clinics' && { borderBottomColor: COLORS.primary, borderBottomWidth: 3 }]}
                        onPress={() => setActiveTab('clinics')}
                    >
                        <Ionicons 
                            name="business" 
                            size={20} 
                            color={activeTab === 'clinics' ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray)} 
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'clinics' ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray) }
                        ]}>
                            Clinics ({filteredClinics.length})
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'users' && { borderBottomColor: COLORS.primary, borderBottomWidth: 3 }]}
                        onPress={() => setActiveTab('users')}
                    >
                        <Ionicons 
                            name="people" 
                            size={20} 
                            color={activeTab === 'users' ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray)} 
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'users' ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray) }
                        ]}>
                            Users ({filteredUsers.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={[styles.searchContainer, { 
                    backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    borderColor: dark ? COLORS.dark3 : COLORS.grayscale200
                }]}>
                    <Ionicons name="search" size={20} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    <TextInput
                        style={[styles.searchInput, { color: dark ? COLORS.white : COLORS.greyscale900 }]}
                        placeholder={`Search ${activeTab}...`}
                        placeholderTextColor={dark ? COLORS.grayscale400 : COLORS.gray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                {activeTab === 'clinics' ? renderClinicFilters() : renderUserFilters()}

                {/* List */}
                <FlatList
                    data={activeTab === 'clinics' ? filteredClinics : filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={activeTab === 'clinics' ? renderClinicCard : renderUserCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: { flex: 1 },
    container: { flex: 1, padding: 16 },
    
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 12,
        padding: 4,
        gap: 8
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8
    },
    tabText: {
        fontSize: 15,
        fontFamily: 'semiBold'
    },
    
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        gap: 12
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'regular'
    },
    
    filterLabel: {
        fontSize: 13,
        fontFamily: 'medium',
        marginBottom: 8
    },
    filtersContainer: {
        marginBottom: 16
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8
    },
    filterChipText: {
        fontSize: 13,
        fontFamily: 'medium'
    },
    
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    cardTitle: {
        fontSize: 17,
        fontFamily: 'bold',
        marginBottom: 4
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: 'regular'
    },
    
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'bold',
        textTransform: 'capitalize'
    },
    
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4
    },
    roleText: {
        fontSize: 10,
        fontFamily: 'bold',
        textTransform: 'capitalize'
    },
    
    infoRow: {
        gap: 8,
        marginBottom: 12
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    infoText: {
        fontSize: 12,
        fontFamily: 'regular'
    },
    
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayscale200
    },
    statBox: {
        flex: 1,
        alignItems: 'center'
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'bold',
        marginBottom: 4
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'regular'
    },
    
    clinicTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8
    },
    clinicTagText: {
        fontSize: 12,
        fontFamily: 'medium'
    }
});

export default ClinicsPage;
