// AdminDashboard - Profesyonel & Minimal Version
// Search + Quick Actions + Minimal Cards + Advanced Filters

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

// Fatura Tipi
interface Invoice {
    id: string;
    clinicId: string;
    invoiceNumber: string;
    month: string;
    year: number;
    issueDate: string;
    dueDate: string;
    patients: number;
    pricePerPatient: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
    paymentMethod?: string;
}

// Clinic Tipi
interface Clinic {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    doctors: number;
    patients: number;
    revenue: number;
    status: 'active' | 'suspended';
    managerName: string;
    registeredDate: string;
    contractStartDate: string;
    lastPaymentDate?: string;
    invoices: Invoice[];
}

// Mock Data
const generateMonthlyInvoices = (clinic: Clinic): Invoice[] => {
    const invoices: Invoice[] = [];
    const startDate = new Date(clinic.contractStartDate);
    const currentDate = new Date();
    
    let invoiceCount = 0;
    const tempDate = new Date(startDate);
    
    while (tempDate <= currentDate) {
        const month = tempDate.toLocaleString('en-US', { month: 'long' });
        const year = tempDate.getFullYear();
        
        const issueDate = new Date(year, tempDate.getMonth(), 28);
        const dueDate = new Date(year, tempDate.getMonth() + 1, 0);
        
        const pricePerPatient = 5;
        const patients = clinic.patients + Math.floor(Math.random() * 100) - 50;
        const subtotal = patients * pricePerPatient;
        const tax = subtotal * 0.10;
        const discount = clinic.status === 'active' ? subtotal * 0.05 : 0;
        const total = subtotal + tax - discount;
        
        const monthsAgo = Math.floor((currentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        let status: 'pending' | 'paid' | 'overdue' = 'paid';
        
        if (monthsAgo === 0) {
            status = 'pending';
        } else if (monthsAgo === 1) {
            status = currentDate > dueDate ? 'overdue' : 'pending';
        }
        
        const invoice: Invoice = {
            id: `INV-${clinic.id}-${year}${String(tempDate.getMonth() + 1).padStart(2, '0')}-${invoiceCount}`,
            clinicId: clinic.id,
            invoiceNumber: `INV-${clinic.id}-${year}${String(tempDate.getMonth() + 1).padStart(2, '0')}`,
            month,
            year,
            issueDate: issueDate.toISOString(),
            dueDate: dueDate.toISOString(),
            patients,
            pricePerPatient,
            subtotal,
            tax,
            discount,
            total,
            status,
            paidDate: status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            paymentMethod: status === 'paid' ? ['Bank Transfer', 'Credit Card', 'PayPal'][Math.floor(Math.random() * 3)] : undefined,
        };
        
        invoices.push(invoice);
        invoiceCount++;
        
        tempDate.setMonth(tempDate.getMonth() + 1);
    }
    
    return invoices;
};

const mockClinics: Clinic[] = [
    { id: '1', name: 'Central Medical Clinic', address: '123 Main Street, New York', phone: '+1 234 567 8900', email: 'central@clinic.com', doctors: 15, patients: 1250, revenue: 125000, status: 'active', managerName: 'John Smith', registeredDate: '2025-01-15', contractStartDate: '2024-06-01', invoices: [] },
    { id: '2', name: 'Sunrise Health Center', address: '456 Oak Avenue, Los Angeles', phone: '+1 234 567 8901', email: 'sunrise@health.com', doctors: 22, patients: 1890, revenue: 189000, status: 'active', managerName: 'Sarah Johnson', registeredDate: '2025-02-10', contractStartDate: '2024-08-15', invoices: [] },
    { id: '3', name: 'City Hospital', address: '789 Park Road, Chicago', phone: '+1 234 567 8902', email: 'city@hospital.com', doctors: 45, patients: 3200, revenue: 320000, status: 'active', managerName: 'Michael Brown', registeredDate: '2025-03-05', contractStartDate: '2024-03-01', invoices: [] },
    { id: '4', name: 'Green Valley Clinic', address: '321 Elm Street, Houston', phone: '+1 234 567 8903', email: 'greenvalley@clinic.com', doctors: 12, patients: 890, revenue: 89000, status: 'suspended', managerName: 'Emily Davis', registeredDate: '2024-12-20', contractStartDate: '2024-05-10', lastPaymentDate: '2024-10-30', invoices: [] },
    { id: '5', name: 'Metropolitan Medical', address: '654 Pine Avenue, Phoenix', phone: '+1 234 567 8904', email: 'metro@medical.com', doctors: 30, patients: 2100, revenue: 210000, status: 'active', managerName: 'David Wilson', registeredDate: '2025-01-25', contractStartDate: '2024-09-01', invoices: [] },
];

// Generate invoices
mockClinics.forEach(clinic => {
    clinic.invoices = generateMonthlyInvoices(clinic);
    const hasOverdueInvoice = clinic.invoices.some(inv => inv.status === 'overdue');
    if (hasOverdueInvoice) {
        clinic.status = 'suspended';
    }
});

const AdminDashboard = () => {
    const router = useRouter();
    const { colors, dark } = useTheme();
    
    const [clinics] = useState(mockClinics);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended'>('all');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'clinics' | 'analytics' | 'messages' | 'settings'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    const totalClinics = clinics.length;
    const activeClinics = clinics.filter((c) => c.status === 'active').length;
    const suspendedClinics = clinics.filter((c) => c.status === 'suspended').length;
    
    const unpaidInvoices = clinics.flatMap(c => c.invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue'));
    const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdueInvoices = unpaidInvoices.filter(inv => inv.status === 'overdue');
    
    const totalPatients = clinics.reduce((sum, clinic) => sum + clinic.patients, 0);
    const totalRevenue = clinics.reduce((sum, clinic) => {
        const paidInvoices = clinic.invoices.filter(inv => inv.status === 'paid');
        return sum + paidInvoices.reduce((s, inv) => s + inv.total, 0);
    }, 0);

    // Search & Filter
    const filteredClinics = clinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            clinic.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || clinic.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.viewLeft}>
                <View style={[styles.avatarContainer, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.avatarText}>AD</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.greeting}>Good Morning 👋</Text>
                    <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        Admin Dashboard
                    </Text>
                </View>
            </View>
            <View style={styles.viewRight}>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <View>
                        <Ionicons name="notifications-outline" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
                        {unpaidInvoices.length > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{unpaidInvoices.length}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/adminsettings')}>
                    <Ionicons name="settings-outline" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSearchBar = () => (
        <View style={[styles.searchContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite }]}>
            <Ionicons name="search-outline" size={20} color={COLORS.gray} />
            <TextInput
                style={[styles.searchInput, { color: dark ? COLORS.white : COLORS.greyscale900 }]}
                placeholder="Search clinics..."
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

    const renderQuickActions = () => {
        const quickActions = [
            { id: '1', icon: 'add-circle', label: 'Add Clinic', color: COLORS.primary, onPress: () => {} },
            { id: '2', icon: 'receipt', label: 'Invoices', color: '#FF6B6B', onPress: () => router.push('/clinicmanagement') },
            { id: '3', icon: 'bar-chart', label: 'Reports', color: '#4ECDC4', onPress: () => {} },
            { id: '4', icon: 'people', label: 'Users', color: '#FFD93D', onPress: () => {} },
            { id: '5', icon: 'settings', label: 'Settings', color: '#A78BFA', onPress: () => router.push('/adminsettings') },
        ];

        return (
            <View style={{ marginVertical: 16 }}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        Quick Actions
                    </Text>
                </View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickActionsContainer}
                >
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={[styles.quickActionCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}
                            onPress={action.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                                <Ionicons name={action.icon as any} size={24} color={action.color} />
                            </View>
                            <Text style={[styles.quickActionLabel, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderOverviewStats = () => {
        const stats = [
            { icon: 'business', value: totalClinics, label: 'Total Clinics', color: COLORS.primary, trend: '+12%' },
            { icon: 'checkmark-circle', value: activeClinics, label: 'Active', color: '#10B981', trend: '+8%' },
            { icon: 'alert-circle', value: unpaidInvoices.length, label: 'Unpaid', color: '#FF6B6B', trend: '-5%' },
            { icon: 'wallet', value: `$${(totalRevenue / 1000).toFixed(0)}K`, label: 'Revenue', color: '#FFD93D', trend: '+15%' },
        ];

        return (
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={[styles.statCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                            <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {stat.value}
                        </Text>
                        <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {stat.label}
                        </Text>
                        <Text style={[styles.statTrend, { color: stat.trend.includes('+') ? '#10B981' : '#FF6B6B' }]}>
                            {stat.trend}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderFilterTabs = () => (
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                <TouchableOpacity 
                    style={[
                        styles.filterChip,
                        selectedStatus === 'all' && { backgroundColor: COLORS.primary },
                        { backgroundColor: selectedStatus === 'all' ? COLORS.primary : (dark ? COLORS.dark2 : COLORS.secondaryWhite) }
                    ]}
                    onPress={() => setSelectedStatus('all')}
                >
                    <Text style={[
                        styles.filterChipText,
                        { color: selectedStatus === 'all' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                    ]}>
                        All ({totalClinics})
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.filterChip,
                        { backgroundColor: selectedStatus === 'active' ? '#10B981' : (dark ? COLORS.dark2 : COLORS.secondaryWhite) }
                    ]}
                    onPress={() => setSelectedStatus('active')}
                >
                    <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={selectedStatus === 'active' ? COLORS.white : '#10B981'} 
                    />
                    <Text style={[
                        styles.filterChipText,
                        { color: selectedStatus === 'active' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                    ]}>
                        Active ({activeClinics})
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.filterChip,
                        { backgroundColor: selectedStatus === 'suspended' ? '#FF6B6B' : (dark ? COLORS.dark2 : COLORS.secondaryWhite) }
                    ]}
                    onPress={() => setSelectedStatus('suspended')}
                >
                    <Ionicons 
                        name="close-circle" 
                        size={16} 
                        color={selectedStatus === 'suspended' ? COLORS.white : '#FF6B6B'} 
                    />
                    <Text style={[
                        styles.filterChipText,
                        { color: selectedStatus === 'suspended' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                    ]}>
                        Inactive ({suspendedClinics})
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    const renderClinicCard = ({ item }: { item: Clinic }) => {
        const unpaidCount = item.invoices.filter(inv => inv.status !== 'paid').length;
        const hasOverdue = item.invoices.some(inv => inv.status === 'overdue');
        
        return (
            <TouchableOpacity 
                style={[styles.clinicCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}
                onPress={() => router.push(`/clinicdetails?id=${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.clinicCardContent}>
                    <View style={styles.clinicCardLeft}>
                        <View style={[
                            styles.clinicIconContainer,
                            { backgroundColor: item.status === 'active' ? COLORS.primary + '15' : '#FF6B6B15' }
                        ]}>
                            <Ionicons 
                                name="business" 
                                size={24} 
                                color={item.status === 'active' ? COLORS.primary : '#FF6B6B'} 
                            />
                        </View>
                        <View style={styles.clinicInfo}>
                            <Text style={[styles.clinicName, { color: dark ? COLORS.white : COLORS.greyscale900 }]} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={styles.clinicMeta}>
                                <Ionicons name="location" size={12} color={COLORS.gray} />
                                <Text style={[styles.clinicAddress, { color: dark ? COLORS.grayscale400 : COLORS.gray }]} numberOfLines={1}>
                                    {item.address}
                                </Text>
                            </View>
                            <View style={styles.clinicStats}>
                                <View style={styles.clinicStatItem}>
                                    <Ionicons name="people" size={14} color={COLORS.primary} />
                                    <Text style={[styles.clinicStatText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        {item.patients}
                                    </Text>
                                </View>
                                <View style={styles.clinicStatDivider} />
                                <View style={styles.clinicStatItem}>
                                    <Ionicons name="medkit" size={14} color={COLORS.primary} />
                                    <Text style={[styles.clinicStatText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        {item.doctors}
                                    </Text>
                                </View>
                                {unpaidCount > 0 && (
                                    <>
                                        <View style={styles.clinicStatDivider} />
                                        <View style={styles.clinicStatItem}>
                                            <Ionicons name="receipt" size={14} color={hasOverdue ? '#FF6B6B' : '#FFA500'} />
                                            <Text style={[styles.clinicStatText, { color: hasOverdue ? '#FF6B6B' : '#FFA500' }]}>
                                                {unpaidCount}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={styles.clinicCardRight}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.status === 'active' ? '#10B98115' : '#FF6B6B15' }
                        ]}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: item.status === 'active' ? '#10B981' : '#FF6B6B' }
                            ]} />
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooterTabs = () => {
        const tabs = [
            { id: 'dashboard', icon: 'home', iconOutline: 'home-outline', label: 'Dashboard' },
            { id: 'clinics', icon: 'business', iconOutline: 'business-outline', label: 'Clinics' },
            { id: 'analytics', icon: 'stats-chart', iconOutline: 'stats-chart-outline', label: 'Analytics' },
            { id: 'messages', icon: 'chatbubbles', iconOutline: 'chatbubbles-outline', label: 'Messages' },
            { id: 'settings', icon: 'settings', iconOutline: 'settings-outline', label: 'Settings' },
        ];

        const handleTabPress = (tabId: string) => {
            setActiveTab(tabId as any);
            if (tabId === 'clinics') {
                router.push('/clinicmanagement');
            } else if (tabId === 'settings') {
                router.push('/adminsettings');
            } else if (tabId === 'messages') {
                router.push('/messaging');
            }
        };

        if (Platform.OS === 'ios') {
            return (
                <View style={styles.footerContainer}>
                    <BlurView
                        intensity={100}
                        tint={dark ? 'dark' : 'light'}
                        style={styles.footerTabBarBlur}
                    >
                        <View style={styles.footerContentWrapper}>
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <TouchableOpacity
                                        key={tab.id}
                                        style={styles.footerTab}
                                        onPress={() => handleTabPress(tab.id)}
                                        activeOpacity={0.6}
                                    >
                                        <Ionicons
                                            name={isActive ? tab.icon as any : tab.iconOutline as any}
                                            size={28}
                                            color={isActive ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray2}
                                        />
                                        <Text style={[
                                            styles.footerTabLabel,
                                            { 
                                                color: isActive ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray2,
                                                fontFamily: isActive ? 'semibold' : 'regular'
                                            }
                                        ]}>
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </BlurView>
                </View>
            );
        }

        // Android için normal footer
        return (
            <View style={[styles.footerTabBar, { backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.footerTab}
                            onPress={() => handleTabPress(tab.id)}
                        >
                            <Ionicons
                                name={isActive ? tab.icon as any : tab.iconOutline as any}
                                size={24}
                                color={isActive ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3}
                            />
                            <Text style={[
                                styles.footerTabLabel,
                                { color: isActive ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3 }
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                {renderSearchBar()}
                
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 90 : 70 }}
                >
                    {renderQuickActions()}
                    {renderOverviewStats()}
                    
                    {unpaidInvoices.length > 0 && (
                        <TouchableOpacity 
                            style={[styles.alertBanner, { backgroundColor: dark ? COLORS.dark2 : '#FFF5F5' }]}
                            onPress={() => router.push('/clinicmanagement')}
                        >
                            <View style={styles.alertIconContainer}>
                                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.alertTitle, { color: dark ? COLORS.white : '#DC2626' }]}>
                                    {unpaidInvoices.length} Unpaid Invoice{unpaidInvoices.length > 1 ? 's' : ''}
                                </Text>
                                <Text style={[styles.alertSubtitle, { color: dark ? COLORS.grayscale400 : '#EF4444' }]}>
                                    ${totalUnpaidAmount.toLocaleString()} total
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                    )}
                    
                    <View style={styles.clinicsSection}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                Clinics ({filteredClinics.length})
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/clinicmanagement')}>
                                <Text style={[styles.seeAllText, { color: COLORS.primary }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {renderFilterTabs()}
                        
                        {filteredClinics.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={48} color={COLORS.gray} />
                                <Text style={[styles.emptyStateText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                    No clinics found
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredClinics}
                                keyExtractor={(item) => item.id}
                                renderItem={renderClinicCard}
                                scrollEnabled={false}
                                contentContainerStyle={styles.clinicsList}
                            />
                        )}
                    </View>
                </ScrollView>
                
                {renderFooterTabs()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: { flex: 1 },
    container: { flex: 1 },
    
    // Header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    viewLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    avatarContainer: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    avatarText: { fontSize: 16, fontFamily: 'bold', color: COLORS.white },
    greeting: { fontSize: 12, fontFamily: 'regular', color: COLORS.gray },
    title: { fontSize: 18, fontFamily: 'bold', marginTop: 2 },
    viewRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: { fontSize: 9, fontFamily: 'bold', color: COLORS.white },
    
    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'regular',
    },
    
    // Quick Actions
    quickActionsContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    quickActionCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 8,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionLabel: {
        fontSize: 12,
        fontFamily: 'semiBold',
        textAlign: 'center',
    },
    
    // Section Headers
    sectionHeader: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'bold',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        fontFamily: 'semiBold',
    },
    
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
        marginVertical: 16,
    },
    statCard: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontFamily: 'bold',
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'regular',
    },
    statTrend: {
        fontSize: 12,
        fontFamily: 'semiBold',
    },
    
    // Alert Banner
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FF6B6B20',
    },
    alertIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B6B20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 14,
        fontFamily: 'bold',
    },
    alertSubtitle: {
        fontSize: 12,
        fontFamily: 'regular',
        marginTop: 2,
    },
    
    // Filters
    filterContainer: {
        marginVertical: 12,
    },
    filterScrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
    },
    filterChipText: {
        fontSize: 13,
        fontFamily: 'semiBold',
    },
    
    // Clinics Section
    clinicsSection: {
        flex: 1,
    },
    clinicsList: {
        paddingHorizontal: 16,
        gap: 12,
        paddingTop: 8,
    },
    
    // Clinic Cards - Minimal Design
    clinicCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    clinicCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clinicCardLeft: {
        flexDirection: 'row',
        flex: 1,
        gap: 12,
    },
    clinicIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clinicInfo: {
        flex: 1,
        gap: 4,
    },
    clinicName: {
        fontSize: 15,
        fontFamily: 'bold',
    },
    clinicMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clinicAddress: {
        fontSize: 11,
        fontFamily: 'regular',
        flex: 1,
    },
    clinicStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    clinicStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clinicStatText: {
        fontSize: 12,
        fontFamily: 'semiBold',
    },
    clinicStatDivider: {
        width: 1,
        height: 12,
        backgroundColor: COLORS.grayscale200,
    },
    clinicCardRight: {
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: 'regular',
    },
    
    // Footer Tab Bar
    footerTabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        height: 60,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayscale200,
    },
    footerTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    footerTabLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    footerTabBarBlur: {
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    footerContentWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        height: 85,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
});

export default AdminDashboard;
