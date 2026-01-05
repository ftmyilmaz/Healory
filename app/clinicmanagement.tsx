// Clinic Management with Tab System (Clinics + Users)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Button from '../components/Button';
import { COLORS } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

// Types
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

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'doctor' | 'patient' | 'admin';
    clinicId?: string;
    clinicName?: string;
    status: 'active' | 'suspended';
    registeredDate: string;
    lastActive: string;
    totalAppointments?: number;
}

// Mock Data - Same as AdminDashboard
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
    { id: '6', name: 'Lakeside Family Clinic', address: '890 Lake Drive, Seattle', phone: '+1 234 567 8905', email: 'lakeside@clinic.com', doctors: 18, patients: 1420, revenue: 142000, status: 'active', managerName: 'Jennifer Martinez', registeredDate: '2024-11-10', contractStartDate: '2024-07-01', invoices: [] },
    { id: '7', name: 'Downtown Health Hub', address: '567 Center Street, San Francisco', phone: '+1 234 567 8906', email: 'downtown@health.com', doctors: 35, patients: 2650, revenue: 265000, status: 'active', managerName: 'Robert Chen', registeredDate: '2024-10-05', contractStartDate: '2024-04-15', invoices: [] },
    { id: '8', name: 'Riverside Medical Center', address: '234 River Road, Boston', phone: '+1 234 567 8907', email: 'riverside@medical.com', doctors: 28, patients: 1980, revenue: 198000, status: 'active', managerName: 'Amanda Thompson', registeredDate: '2024-09-20', contractStartDate: '2024-05-20', invoices: [] },
    { id: '9', name: 'Mountain View Clinic', address: '456 Highland Avenue, Denver', phone: '+1 234 567 8908', email: 'mountainview@clinic.com', doctors: 20, patients: 1560, revenue: 156000, status: 'active', managerName: 'Christopher Lee', registeredDate: '2024-12-15', contractStartDate: '2024-06-10', invoices: [] },
    { id: '10', name: 'Coastal Care Center', address: '789 Beach Boulevard, Miami', phone: '+1 234 567 8909', email: 'coastal@care.com', doctors: 25, patients: 1850, revenue: 185000, status: 'active', managerName: 'Maria Garcia', registeredDate: '2024-11-30', contractStartDate: '2024-08-01', invoices: [] },
];

mockClinics.forEach(clinic => {
    clinic.invoices = generateMonthlyInvoices(clinic);
    const hasOverdueInvoice = clinic.invoices.some(inv => inv.status === 'overdue');
    if (hasOverdueInvoice) {
        clinic.status = 'suspended';
    }
});

// Mock Users
const mockUsers: User[] = [
    { id: 'U1', name: 'Dr. Michael Johnson', email: 'michael.j@clinic.com', phone: '+1 555 0101', role: 'doctor', clinicId: '1', clinicName: 'Central Medical Clinic', status: 'active', registeredDate: '2024-01-15', lastActive: '2025-01-04', totalAppointments: 245 },
    { id: 'U2', name: 'Dr. Sarah Williams', email: 'sarah.w@health.com', phone: '+1 555 0102', role: 'doctor', clinicId: '2', clinicName: 'Sunrise Health Center', status: 'active', registeredDate: '2024-02-20', lastActive: '2025-01-03', totalAppointments: 312 },
    { id: 'U3', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 555 0103', role: 'patient', status: 'active', registeredDate: '2024-03-10', lastActive: '2025-01-04', totalAppointments: 12 },
    { id: 'U4', name: 'John Smith', email: 'john.s@email.com', phone: '+1 555 0104', role: 'patient', status: 'suspended', registeredDate: '2024-04-05', lastActive: '2024-12-15', totalAppointments: 8 },
    { id: 'U5', name: 'Dr. Robert Brown', email: 'robert.b@hospital.com', phone: '+1 555 0105', role: 'doctor', clinicId: '3', clinicName: 'City Hospital', status: 'active', registeredDate: '2024-05-12', lastActive: '2025-01-04', totalAppointments: 456 },
];

const ClinicManagement = () => {
    const router = useRouter();
    const { colors, dark } = useTheme();
    
    const [activeTab, setActiveTab] = useState<'clinics' | 'users'>('clinics');
    const [clinics] = useState(mockClinics);
    const [users] = useState(mockUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    
    // Clinic Filters
    const [clinicStatusFilter, setClinicStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    
    // User Filters
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'doctor' | 'patient' | 'admin'>('all');
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
    
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    
    const refInvoiceHistorySheet = useRef<any>(null);
    const refClinicMenuSheet = useRef<any>(null);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Filtered Clinics
    const filteredClinics = clinics.filter((clinic) => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            clinic.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = clinicStatusFilter === 'all' || clinic.status === clinicStatusFilter;
        
        let matchesInvoiceStatus = true;
        if (invoiceStatusFilter !== 'all') {
            matchesInvoiceStatus = clinic.invoices.some(inv => inv.status === invoiceStatusFilter);
        }
        
        return matchesSearch && matchesStatus && matchesInvoiceStatus;
    });

    // Filtered Users
    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
        const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Management
                </Text>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
                </TouchableOpacity>
            </View>

            {/* Tab Selector */}
            <View style={[styles.tabContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'clinics' && { backgroundColor: COLORS.primary }]}
                    onPress={() => setActiveTab('clinics')}
                >
                    <Ionicons name="business" size={20} color={activeTab === 'clinics' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900)} />
                    <Text style={[styles.tabText, { color: activeTab === 'clinics' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }]}>
                        Clinics ({filteredClinics.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'users' && { backgroundColor: COLORS.primary }]}
                    onPress={() => setActiveTab('users')}
                >
                    <Ionicons name="people" size={20} color={activeTab === 'users' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900)} />
                    <Text style={[styles.tabText, { color: activeTab === 'users' ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }]}>
                        Users ({filteredUsers.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.white, borderColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}>
                <Ionicons name="search" size={20} color={COLORS.gray} />
                <TextInput
                    style={[styles.searchInput, { color: dark ? COLORS.white : COLORS.greyscale900 }]}
                    placeholder={`Search ${activeTab}...`}
                    placeholderTextColor={COLORS.gray}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderClinicFilters = () => (
        <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                <TouchableOpacity 
                    style={[styles.filterChip, clinicStatusFilter === 'all' && styles.filterChipActive]}
                    onPress={() => setClinicStatusFilter('all')}
                >
                    <Text style={[styles.filterChipText, clinicStatusFilter === 'all' && styles.filterChipTextActive]}>
                        All Clinics
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, clinicStatusFilter === 'active' && styles.filterChipActive]}
                    onPress={() => setClinicStatusFilter('active')}
                >
                    <Ionicons name="checkmark-circle" size={16} color={clinicStatusFilter === 'active' ? COLORS.white : '#10B981'} />
                    <Text style={[styles.filterChipText, clinicStatusFilter === 'active' && styles.filterChipTextActive]}>
                        Active
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, clinicStatusFilter === 'suspended' && styles.filterChipActive]}
                    onPress={() => setClinicStatusFilter('suspended')}
                >
                    <Ionicons name="close-circle" size={16} color={clinicStatusFilter === 'suspended' ? COLORS.white : '#FF6B6B'} />
                    <Text style={[styles.filterChipText, clinicStatusFilter === 'suspended' && styles.filterChipTextActive]}>
                        Suspended
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.filterDivider} />
                
                <TouchableOpacity 
                    style={[styles.filterChip, invoiceStatusFilter === 'pending' && styles.filterChipActive]}
                    onPress={() => setInvoiceStatusFilter(invoiceStatusFilter === 'pending' ? 'all' : 'pending')}
                >
                    <Text style={[styles.filterChipText, invoiceStatusFilter === 'pending' && styles.filterChipTextActive]}>
                        Has Pending
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, invoiceStatusFilter === 'overdue' && styles.filterChipActive]}
                    onPress={() => setInvoiceStatusFilter(invoiceStatusFilter === 'overdue' ? 'all' : 'overdue')}
                >
                    <Text style={[styles.filterChipText, invoiceStatusFilter === 'overdue' && styles.filterChipTextActive]}>
                        Has Overdue
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    const renderUserFilters = () => (
        <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                <TouchableOpacity 
                    style={[styles.filterChip, userRoleFilter === 'all' && styles.filterChipActive]}
                    onPress={() => setUserRoleFilter('all')}
                >
                    <Text style={[styles.filterChipText, userRoleFilter === 'all' && styles.filterChipTextActive]}>
                        All Users
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, userRoleFilter === 'doctor' && styles.filterChipActive]}
                    onPress={() => setUserRoleFilter('doctor')}
                >
                    <Ionicons name="medical" size={16} color={userRoleFilter === 'doctor' ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.filterChipText, userRoleFilter === 'doctor' && styles.filterChipTextActive]}>
                        Doctors
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, userRoleFilter === 'patient' && styles.filterChipActive]}
                    onPress={() => setUserRoleFilter('patient')}
                >
                    <Ionicons name="person" size={16} color={userRoleFilter === 'patient' ? COLORS.white : '#4ECDC4'} />
                    <Text style={[styles.filterChipText, userRoleFilter === 'patient' && styles.filterChipTextActive]}>
                        Patients
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.filterDivider} />
                
                <TouchableOpacity 
                    style={[styles.filterChip, userStatusFilter === 'active' && styles.filterChipActive]}
                    onPress={() => setUserStatusFilter(userStatusFilter === 'active' ? 'all' : 'active')}
                >
                    <Text style={[styles.filterChipText, userStatusFilter === 'active' && styles.filterChipTextActive]}>
                        Active
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, userStatusFilter === 'suspended' && styles.filterChipActive]}
                    onPress={() => setUserStatusFilter(userStatusFilter === 'suspended' ? 'all' : 'suspended')}
                >
                    <Text style={[styles.filterChipText, userStatusFilter === 'suspended' && styles.filterChipTextActive]}>
                        Suspended
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    const renderClinicCard = ({ item: clinic }: { item: Clinic }) => {
        const unpaidInvoices = clinic.invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
        const overdueInvoices = unpaidInvoices.filter(inv => inv.status === 'overdue');
        
        return (
            <TouchableOpacity 
                style={[styles.clinicCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white, borderColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}
                onPress={() => router.push(`/clinicdetails?id=${clinic.id}`)}
            >
                <View style={styles.clinicCardHeader}>
                    <View style={[styles.clinicAvatar, { backgroundColor: clinic.status === 'active' ? COLORS.primary + '20' : '#FF6B6B20' }]}>
                        <Ionicons name="business" size={24} color={clinic.status === 'active' ? COLORS.primary : '#FF6B6B'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.clinicName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.name}
                        </Text>
                        <Text style={[styles.clinicAddress, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {clinic.address}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        setSelectedClinic(clinic);
                        refClinicMenuSheet.current?.open();
                    }}>
                        <Ionicons name="ellipsis-vertical" size={20} color={dark ? COLORS.white : COLORS.greyscale900} />
                    </TouchableOpacity>
                </View>

                <View style={styles.clinicStats}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.doctors || 0}</Text>
                        <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Doctors</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.patients || 0}</Text>
                        <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Patients</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>${((clinic.revenue || 0) / 1000).toFixed(0)}K</Text>
                        <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Revenue</Text>
                    </View>
                </View>

                <View style={styles.clinicFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: clinic.status === 'active' ? '#10B98120' : '#FF6B6B20' }]}>
                        <Ionicons name={clinic.status === 'active' ? 'checkmark-circle' : 'close-circle'} size={14} color={clinic.status === 'active' ? '#10B981' : '#FF6B6B'} />
                        <Text style={[styles.statusText, { color: clinic.status === 'active' ? '#10B981' : '#FF6B6B' }]}>
                            {clinic.status === 'active' ? 'Active' : 'Suspended'}
                        </Text>
                    </View>
                    
                    {unpaidInvoices.length > 0 && (
                        <TouchableOpacity 
                            style={[styles.invoiceButton, { backgroundColor: overdueInvoices.length > 0 ? '#FF6B6B20' : '#FFA50020' }]}
                            onPress={() => {
                                setSelectedClinic(clinic);
                                refInvoiceHistorySheet.current?.open();
                            }}
                        >
                            <Ionicons name="document-text" size={14} color={overdueInvoices.length > 0 ? '#FF6B6B' : '#FFA500'} />
                            <Text style={[styles.invoiceButtonText, { color: overdueInvoices.length > 0 ? '#FF6B6B' : '#FFA500' }]}>
                                {unpaidInvoices.length} Unpaid
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity onPress={() => router.push(`/clinicdetails?id=${clinic.id}`)}>
                        <Text style={[styles.viewDetailsText, { color: COLORS.primary }]}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderUserCard = ({ item: user }: { item: User }) => (
        <TouchableOpacity 
            style={[styles.userCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white, borderColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}
            onPress={() => {}}
        >
            <View style={styles.userCardHeader}>
                <View style={[styles.userAvatar, { backgroundColor: user.role === 'doctor' ? COLORS.primary + '20' : '#4ECDC420' }]}>
                    <Ionicons name={user.role === 'doctor' ? 'medical' : 'person'} size={24} color={user.role === 'doctor' ? COLORS.primary : '#4ECDC4'} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {user.name}
                    </Text>
                    <Text style={[styles.userEmail, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        {user.email}
                    </Text>
                    {user.clinicName && (
                        <Text style={[styles.userClinic, { color: COLORS.primary }]}>
                            {user.clinicName}
                        </Text>
                    )}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: user.role === 'doctor' ? COLORS.primary + '20' : '#4ECDC420' }]}>
                    <Text style={[styles.roleText, { color: user.role === 'doctor' ? COLORS.primary : '#4ECDC4' }]}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.userFooter}>
                <View style={styles.userStat}>
                    <Ionicons name="calendar" size={14} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    <Text style={[styles.userStatText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        {user.totalAppointments || 0} appointments
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: user.status === 'active' ? '#10B98120' : '#FF6B6B20' }]}>
                    <Ionicons name={user.status === 'active' ? 'checkmark-circle' : 'close-circle'} size={12} color={user.status === 'active' ? '#10B981' : '#FF6B6B'} />
                    <Text style={[styles.statusText, { color: user.status === 'active' ? '#10B981' : '#FF6B6B', fontSize: 11 }]}>
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const generateInvoiceHTML = (invoice: Invoice | null, clinic: Clinic | null) => {
        if (!invoice || !clinic) {
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; text-align: center; }
        .error { color: #FF6B6B; font-size: 18px; }
    </style>
</head>
<body>
    <div class="error">⚠️ Invoice data not available</div>
</body>
</html>`;
        }
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, system-ui, sans-serif; padding: 20px; background: #f5f5f5; }
        .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #246BFD; }
        .logo { font-size: 32px; font-weight: bold; color: #246BFD; }
        .invoice-number { font-size: 24px; font-weight: bold; }
        .status-${invoice.status} { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 8px; background: ${invoice.status === 'paid' ? '#10B98120' : invoice.status === 'pending' ? '#FFA50020' : '#FF6B6B20'}; color: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#FFA500' : '#FF6B6B'}; }
        .parties { display: flex; gap: 40px; margin-bottom: 40px; }
        .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #246BFD; }
        .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .summary { margin-left: auto; width: 300px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .summary-total { border-top: 2px solid #246BFD; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div>
                <div class="logo">Healory</div>
                <p>Medical Platform Services</p>
            </div>
            <div>
                <div class="invoice-number">${invoice.invoiceNumber}</div>
                <p>Issue: ${new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <span class="status-${invoice.status}">${invoice.status.toUpperCase()}</span>
            </div>
        </div>
        
        <div class="parties">
            <div>
                <strong>From:</strong><br>
                Healory Inc.<br>
                123 Healthcare Ave<br>
                San Francisco, CA 94102
            </div>
            <div>
                <strong>Bill To:</strong><br>
                ${clinic.name}<br>
                ${clinic.address}<br>
                ${clinic.email}
            </div>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Quantity</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Patient Management Services</strong><br>${invoice.month} ${invoice.year}</td>
                    <td style="text-align: right;">${invoice.patients}</td>
                    <td style="text-align: right;">$${invoice.pricePerPatient}</td>
                    <td style="text-align: right;">$${invoice.subtotal.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${invoice.subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%):</span>
                <span>$${invoice.tax.toLocaleString()}</span>
            </div>
            ${invoice.discount > 0 ? `<div class="summary-row"><span>Discount:</span><span>-$${invoice.discount.toLocaleString()}</span></div>` : ''}
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${invoice.total.toLocaleString()}</span>
            </div>
        </div>
    </div>
</body>
</html>`;
    };

    const renderInvoiceHistorySheet = () => {
        if (!selectedClinic) return null;
        
        const sortedInvoices = [...selectedClinic.invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        
        return (
            <RBSheet ref={refInvoiceHistorySheet} height={650} closeOnPressMask={true} customStyles={{
                wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
                container: { 
                    backgroundColor: dark ? COLORS.dark1 : COLORS.white, 
                    borderTopLeftRadius: 32, 
                    borderTopRightRadius: 32,
                    paddingBottom: 20
                },
                draggableIcon: {
                    backgroundColor: dark ? COLORS.grayscale400 : COLORS.grayscale200,
                    width: 40,
                    height: 5,
                    borderRadius: 3
                }
            }}>
                <View style={styles.sheetContainer}>
                    {/* Modern Header */}
                    <View style={[styles.invoiceSheetHeader, { borderBottomColor: dark ? COLORS.dark3 : COLORS.grayscale100 }]}>
                        <View style={[styles.invoiceHeaderIcon, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="receipt" size={28} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.invoiceSheetTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                Invoice History
                            </Text>
                            <Text style={[styles.invoiceSheetSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                {selectedClinic.name}
                            </Text>
                            <View style={styles.invoiceStatsRow}>
                                <View style={styles.invoiceStat}>
                                    <Text style={[styles.invoiceStatValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                        {sortedInvoices.length}
                                    </Text>
                                    <Text style={[styles.invoiceStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Total
                                    </Text>
                                </View>
                                <View style={styles.invoiceStat}>
                                    <Text style={[styles.invoiceStatValue, { color: '#10B981' }]}>
                                        {sortedInvoices.filter(i => i.status === 'paid').length}
                                    </Text>
                                    <Text style={[styles.invoiceStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Paid
                                    </Text>
                                </View>
                                <View style={styles.invoiceStat}>
                                    <Text style={[styles.invoiceStatValue, { color: '#FFA500' }]}>
                                        {sortedInvoices.filter(i => i.status === 'pending').length}
                                    </Text>
                                    <Text style={[styles.invoiceStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Pending
                                    </Text>
                                </View>
                                <View style={styles.invoiceStat}>
                                    <Text style={[styles.invoiceStatValue, { color: '#FF6B6B' }]}>
                                        {sortedInvoices.filter(i => i.status === 'overdue').length}
                                    </Text>
                                    <Text style={[styles.invoiceStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Overdue
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    
                    {/* Invoice List */}
                    <FlatList
                        data={sortedInvoices}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16, gap: 12 }}
                        renderItem={({ item: invoice }) => (
                            <View style={[styles.invoiceItemModern, { 
                                backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100,
                                borderColor: dark ? COLORS.dark3 : COLORS.grayscale200
                            }]}>
                                {/* Invoice Header */}
                                <View style={styles.invoiceItemHeader}>
                                    <View style={[styles.invoiceIconCircle, { 
                                        backgroundColor: invoice.status === 'paid' ? '#10B98115' : invoice.status === 'pending' ? '#FFA50015' : '#FF6B6B15' 
                                    }]}>
                                        <Ionicons 
                                            name="document-text" 
                                            size={20} 
                                            color={invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#FFA500' : '#FF6B6B'} 
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.invoiceMonthModern, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            {invoice.month} {invoice.year}
                                        </Text>
                                        <Text style={[styles.invoiceNumberSmall, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                            {invoice.invoiceNumber}
                                        </Text>
                                    </View>
                                    <View style={[styles.invoiceStatusBadgeModern, { 
                                        backgroundColor: invoice.status === 'paid' ? '#10B98115' : invoice.status === 'pending' ? '#FFA50015' : '#FF6B6B15' 
                                    }]}>
                                        <View style={[styles.statusDot, {
                                            backgroundColor: invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#FFA500' : '#FF6B6B'
                                        }]} />
                                        <Text style={[styles.invoiceStatusTextModern, { 
                                            color: invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#FFA500' : '#FF6B6B' 
                                        }]}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Invoice Details */}
                                <View style={styles.invoiceDetails}>
                                    <View style={styles.invoiceDetailRow}>
                                        <View style={styles.invoiceDetailItem}>
                                            <Ionicons name="calendar-outline" size={14} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                                            <Text style={[styles.invoiceDetailLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                                Issue Date
                                            </Text>
                                        </View>
                                        <Text style={[styles.invoiceDetailValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            {new Date(invoice.issueDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.invoiceDetailRow}>
                                        <View style={styles.invoiceDetailItem}>
                                            <Ionicons name="time-outline" size={14} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                                            <Text style={[styles.invoiceDetailLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                                Due Date
                                            </Text>
                                        </View>
                                        <Text style={[styles.invoiceDetailValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.invoiceDetailRow}>
                                        <View style={styles.invoiceDetailItem}>
                                            <Ionicons name="people-outline" size={14} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                                            <Text style={[styles.invoiceDetailLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                                Patients
                                            </Text>
                                        </View>
                                        <Text style={[styles.invoiceDetailValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            {invoice.patients}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Amount and Action */}
                                <View style={styles.invoiceFooterModern}>
                                    <View>
                                        <Text style={[styles.invoiceTotalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                            Total Amount
                                        </Text>
                                        <Text style={[styles.invoiceAmountModern, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            ${invoice.total.toLocaleString()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={[styles.viewInvoiceButton, { 
                                            backgroundColor: COLORS.primary 
                                        }]}
                                        onPress={() => {
                                            setSelectedInvoice(invoice);
                                            refInvoiceHistorySheet.current?.close();
                                            setTimeout(() => {
                                                setInvoiceModalVisible(true);
                                            }, 300);
                                        }}
                                    >
                                        <Ionicons name="eye" size={16} color={COLORS.white} />
                                        <Text style={styles.viewInvoiceButtonText}>
                                            View Invoice
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </RBSheet>
        );
    };

    const renderClinicMenuSheet = () => (
        <RBSheet ref={refClinicMenuSheet} height={420} closeOnPressMask={true} customStyles={{
            wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
            container: { 
                backgroundColor: dark ? COLORS.dark1 : COLORS.white, 
                borderTopLeftRadius: 32, 
                borderTopRightRadius: 32,
                paddingBottom: 20
            },
            draggableIcon: {
                backgroundColor: dark ? COLORS.grayscale400 : COLORS.grayscale200,
                width: 40,
                height: 5,
                borderRadius: 3
            }
        }}>
            <View style={styles.sheetContainer}>
                {/* Header with Clinic Info */}
                <View style={[styles.sheetHeaderModern, { borderBottomColor: dark ? COLORS.dark3 : COLORS.grayscale100 }]}>
                    <View style={[styles.clinicAvatarLarge, { backgroundColor: selectedClinic?.status === 'active' ? COLORS.primary + '15' : '#FF6B6B15' }]}>
                        <Ionicons 
                            name="business" 
                            size={32} 
                            color={selectedClinic?.status === 'active' ? COLORS.primary : '#FF6B6B'} 
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.sheetTitleModern, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {selectedClinic?.name}
                        </Text>
                        <Text style={[styles.sheetSubtitleModern, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {selectedClinic?.address}
                        </Text>
                        <View style={[styles.statusBadgeModern, { 
                            backgroundColor: selectedClinic?.status === 'active' ? '#10B98115' : '#FF6B6B15',
                            marginTop: 8
                        }]}>
                            <View style={[styles.statusDot, {
                                backgroundColor: selectedClinic?.status === 'active' ? '#10B981' : '#FF6B6B'
                            }]} />
                            <Text style={[styles.statusTextModern, { 
                                color: selectedClinic?.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]}>
                                {selectedClinic?.status === 'active' ? 'Active' : 'Suspended'}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Menu Items */}
                <View style={{ padding: 20, gap: 10 }}>
                    <TouchableOpacity 
                        style={[styles.menuItemModern, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}
                        onPress={() => {
                            refClinicMenuSheet.current?.close();
                            setTimeout(() => {
                                router.push(`/clinicdetails?id=${selectedClinic?.id}`);
                            }, 300);
                        }}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="eye" size={20} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.menuItemTextModern, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                View Details
                            </Text>
                            <Text style={[styles.menuItemSubtext, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                See complete clinic information
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.menuItemModern, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}
                        onPress={() => {
                            refClinicMenuSheet.current?.close();
                            setTimeout(() => {
                                refInvoiceHistorySheet.current?.open();
                            }, 300);
                        }}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#FFA50015' }]}>
                            <Ionicons name="document-text" size={20} color="#FFA500" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.menuItemTextModern, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                View Invoices
                            </Text>
                            <Text style={[styles.menuItemSubtext, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                {selectedClinic?.invoices.length || 0} invoices available
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.menuItemModern, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}
                        onPress={() => {
                            refClinicMenuSheet.current?.close();
                            setTimeout(() => {
                                Alert.alert('Contact', `Contacting ${selectedClinic?.name}...`, [
                                    { text: 'Call', onPress: () => {} },
                                    { text: 'Email', onPress: () => {} },
                                    { text: 'Cancel', style: 'cancel' }
                                ]);
                            }, 300);
                        }}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#4ECDC415' }]}>
                            <Ionicons name="mail" size={20} color="#4ECDC4" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.menuItemTextModern, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                Contact Clinic
                            </Text>
                            <Text style={[styles.menuItemSubtext, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Send message or call
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.menuItemModern, { 
                            backgroundColor: selectedClinic?.status === 'active' ? '#FF6B6B10' : '#10B98110',
                            borderWidth: 1,
                            borderColor: selectedClinic?.status === 'active' ? '#FF6B6B30' : '#10B98130'
                        }]}
                        onPress={() => {
                            refClinicMenuSheet.current?.close();
                            const action = selectedClinic?.status === 'active' ? 'suspend' : 'activate';
                            setTimeout(() => {
                                Alert.alert(
                                    `${action.charAt(0).toUpperCase() + action.slice(1)} Clinic`,
                                    `Are you sure you want to ${action} ${selectedClinic?.name}?`,
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { 
                                            text: 'Confirm', 
                                            style: 'destructive',
                                            onPress: () => Alert.alert('Success', `Clinic ${action}d successfully!`) 
                                        }
                                    ]
                                );
                            }, 300);
                        }}
                    >
                        <View style={[styles.menuIconContainer, { 
                            backgroundColor: selectedClinic?.status === 'active' ? '#FF6B6B15' : '#10B98115' 
                        }]}>
                            <Ionicons 
                                name={selectedClinic?.status === 'active' ? 'close-circle' : 'checkmark-circle'} 
                                size={20} 
                                color={selectedClinic?.status === 'active' ? '#FF6B6B' : '#10B981'} 
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.menuItemTextModern, { 
                                color: selectedClinic?.status === 'active' ? '#FF6B6B' : '#10B981' 
                            }]}>
                                {selectedClinic?.status === 'active' ? 'Suspend Clinic' : 'Activate Clinic'}
                            </Text>
                            <Text style={[styles.menuItemSubtext, { 
                                color: selectedClinic?.status === 'active' ? '#FF6B6B90' : '#10B98190' 
                            }]}>
                                {selectedClinic?.status === 'active' ? 'Temporarily disable access' : 'Restore clinic access'}
                            </Text>
                        </View>
                        <Ionicons 
                            name="chevron-forward" 
                            size={20} 
                            color={selectedClinic?.status === 'active' ? '#FF6B6B' : '#10B981'} 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </RBSheet>
    );

    const renderInvoiceModal = () => (
        <Modal visible={invoiceModalVisible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={{ flex: 1, backgroundColor: dark ? COLORS.dark1 : COLORS.white }}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity 
                        onPress={() => setInvoiceModalVisible(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={28} color={dark ? COLORS.white : COLORS.greyscale900} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[styles.modalTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {selectedInvoice?.invoiceNumber || 'Invoice'}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {selectedInvoice?.month} {selectedInvoice?.year}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => {
                            if (!selectedInvoice) return;
                            Share.share({ 
                                message: `Invoice ${selectedInvoice.invoiceNumber}\n${selectedInvoice.month} ${selectedInvoice.year}\nTotal: $${selectedInvoice.total.toLocaleString()}` 
                            });
                        }}
                        style={styles.modalShareButton}
                    >
                        <Ionicons name="share-outline" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
                    </TouchableOpacity>
                </View>
                <WebView 
                    source={{ html: generateInvoiceHTML(selectedInvoice, selectedClinic) }}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: dark ? COLORS.white : COLORS.greyscale900 }}>Loading invoice...</Text>
                        </View>
                    )}
                />
                {selectedInvoice?.status !== 'paid' && (
                    <View style={styles.modalFooter}>
                        <Button
                            title="Mark as Paid"
                            filled
                            onPress={() => {
                                if (!selectedInvoice) return;
                                Alert.alert('Mark as Paid', `Mark ${selectedInvoice.invoiceNumber} as paid?`, [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Confirm', onPress: () => {
                                        setInvoiceModalVisible(false);
                                        Alert.alert('Success', 'Invoice marked as paid!');
                                    }}
                                ]);
                            }}
                        />
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                
                {activeTab === 'clinics' && renderClinicFilters()}
                {activeTab === 'users' && renderUserFilters()}
                
                {activeTab === 'clinics' ? (
                    <FlatList
                        data={filteredClinics}
                        keyExtractor={(item) => item.id}
                        renderItem={renderClinicCard}
                        contentContainerStyle={{ padding: 16, gap: 12 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="business-outline" size={64} color={COLORS.gray} />
                                <Text style={[styles.emptyText, { color: COLORS.gray }]}>
                                    No clinics found
                                </Text>
                            </View>
                        }
                    />
                ) : (
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderUserCard}
                        contentContainerStyle={{ padding: 16, gap: 12 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={64} color={COLORS.gray} />
                                <Text style={[styles.emptyText, { color: COLORS.gray }]}>
                                    No users found
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
            
            {renderInvoiceHistorySheet()}
            {renderClinicMenuSheet()}
            {renderInvoiceModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: { flex: 1 },
    container: { flex: 1 },
    headerContainer: { padding: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontFamily: 'bold', flex: 1, textAlign: 'center', marginRight: 32 },
    
    tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
    tabText: { fontSize: 14, fontFamily: 'bold' },
    
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'regular' },
    
    filtersContainer: { paddingHorizontal: 16, paddingBottom: 8 },
    filtersScroll: { gap: 8 },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.grayscale200, gap: 6 },
    filterChipActive: { backgroundColor: COLORS.primary },
    filterChipText: { fontSize: 13, fontFamily: 'medium', color: COLORS.greyscale900 },
    filterChipTextActive: { color: COLORS.white },
    filterDivider: { width: 1, height: 30, backgroundColor: COLORS.grayscale200, marginHorizontal: 4 },
    
    clinicCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
    clinicCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
    clinicAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    clinicName: { fontSize: 16, fontFamily: 'bold', marginBottom: 4 },
    clinicAddress: { fontSize: 13, fontFamily: 'regular' },
    clinicStats: { flexDirection: 'row', marginBottom: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.grayscale200 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontFamily: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 11, fontFamily: 'regular' },
    clinicFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
    statusText: { fontSize: 12, fontFamily: 'bold' },
    invoiceButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
    invoiceButtonText: { fontSize: 12, fontFamily: 'bold' },
    viewDetailsText: { fontSize: 13, fontFamily: 'bold', marginLeft: 'auto' },
    
    userCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
    userCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
    userAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    userName: { fontSize: 15, fontFamily: 'bold', marginBottom: 3 },
    userEmail: { fontSize: 12, fontFamily: 'regular', marginBottom: 3 },
    userClinic: { fontSize: 11, fontFamily: 'medium' },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    roleText: { fontSize: 11, fontFamily: 'bold' },
    userFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.grayscale200 },
    userStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    userStatText: { fontSize: 12, fontFamily: 'regular' },
    
    sheetContainer: {
        flex: 1,
    },
    invoiceSheetHeader: {
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    invoiceHeaderIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    invoiceSheetTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    invoiceSheetSubtitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    invoiceStatsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    invoiceStat: {
        alignItems: 'center',
    },
    invoiceStatValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    invoiceStatLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    invoiceItemModern: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 12,
    },
    invoiceItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    invoiceIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    invoiceMonthModern: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    invoiceNumberSmall: {
        fontSize: 12,
    },
    invoiceStatusBadgeModern: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    invoiceStatusTextModern: {
        fontSize: 12,
        fontWeight: '600',
    },
    invoiceDetails: {
        gap: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.grayscale200 + '40',
    },
    invoiceDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    invoiceDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    invoiceDetailLabel: {
        fontSize: 12,
    },
    invoiceDetailValue: {
        fontSize: 13,
        fontWeight: '500',
    },
    invoiceFooterModern: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
    },
    invoiceTotalLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    invoiceAmountModern: {
        fontSize: 22,
        fontWeight: '700',
    },
    viewInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    viewInvoiceButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    
    sheetHeaderModern: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
        gap: 12,
        borderBottomWidth: 1,
    },
    clinicAvatarLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetTitleModern: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    sheetSubtitleModern: {
        fontSize: 13,
    },
    statusBadgeModern: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
    },
    statusTextModern: {
        fontSize: 12,
        fontWeight: '600',
    },
    menuItemModern: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 12,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemTextModern: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 3,
    },
    menuItemSubtext: {
        fontSize: 12,
    },
    
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayscale200,
        gap: 12,
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    modalShareButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayscale200,
    },
    
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 16,
    },
});

export default ClinicManagement;
