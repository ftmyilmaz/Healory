import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { COLORS, SIZES, icons } from '../../constants';
import { useTheme } from '../../theme/ThemeProvider';

// Types
interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    items: { description: string; amount: number }[];
}

interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastVisit: string;
    totalVisits: number;
    status: 'active' | 'inactive';
}

interface Contact {
    phone: string;
    email: string;
    address: string;
    website?: string;
    emergencyContact?: string;
}

interface Manager {
    name: string;
    email: string;
    phone: string;
    role: string;
    joinedDate: string;
    avatar?: string;
}

interface ClinicDetail {
    id: string;
    name: string;
    status: 'active' | 'suspended';
    doctors: number;
    patients: number;
    invoices: Invoice[];
    recentPatients: Patient[];
    contact: Contact;
    manager: Manager;
}

// Mock Data
const mockClinicDetails: ClinicDetail = {
    id: '1',
    name: 'Central Medical Clinic',
    status: 'active',
    doctors: 15,
    patients: 1250,
    invoices: [
        { id: 'inv1', invoiceNumber: 'INV-2024-001', date: '2024-01-01', dueDate: '2024-01-15', amount: 2500, status: 'paid', items: [{ description: 'Monthly Subscription', amount: 2500 }] },
        { id: 'inv2', invoiceNumber: 'INV-2024-002', date: '2024-02-01', dueDate: '2024-02-15', amount: 2500, status: 'pending', items: [{ description: 'Monthly Subscription', amount: 2500 }] },
        { id: 'inv3', invoiceNumber: 'INV-2024-003', date: '2024-03-01', dueDate: '2024-03-15', amount: 2500, status: 'overdue', items: [{ description: 'Monthly Subscription', amount: 2500 }] },
    ],
    recentPatients: [
        { id: 'p1', name: 'Alice Cooper', email: 'alice@email.com', phone: '+1 234 567 8900', lastVisit: '2024-01-03', totalVisits: 12, status: 'active' },
        { id: 'p2', name: 'Bob Martinez', email: 'bob@email.com', phone: '+1 234 567 8901', lastVisit: '2024-01-02', totalVisits: 8, status: 'active' },
        { id: 'p3', name: 'Charlie Davis', email: 'charlie@email.com', phone: '+1 234 567 8902', lastVisit: '2023-12-15', totalVisits: 5, status: 'inactive' },
    ],
    contact: {
        phone: '+1 234 567 8900',
        email: 'central@clinic.com',
        address: '123 Main Street, New York, NY 10001',
        website: 'www.centralmedical.com',
        emergencyContact: '+1 234 567 8999'
    },
    manager: {
        name: 'John Smith',
        email: 'john.smith@clinic.com',
        phone: '+1 234 567 8905',
        role: 'Clinic Manager',
        joinedDate: '2020-05-15'
    }
};

type TabType = 'overview' | 'invoices' | 'patients' | 'contact';

const ClinicDetails = () => {
    const router = useRouter();
    const { colors, dark } = useTheme();
    const { id } = useLocalSearchParams();
    
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    
    const clinic = mockClinicDetails;
    
    const totalInvoiceAmount = clinic.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = clinic.invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = clinic.invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = clinic.invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Clinic Details
            </Text>
            <TouchableOpacity onPress={() => {}}>
                <Ionicons name="ellipsis-vertical" size={24} color={dark ? COLORS.white : COLORS.greyscale900} />
            </TouchableOpacity>
        </View>
    );

    const renderClinicHeader = () => (
        <View style={[styles.clinicHeader, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
            <View style={styles.clinicHeaderTop}>
                <View style={[styles.clinicLogo, { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={[styles.clinicLogoText, { color: COLORS.primary }]}>
                        {clinic.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                    </Text>
                </View>
                
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.clinicName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.name}
                        </Text>
                        <View style={[styles.statusBadgeLarge, { 
                            backgroundColor: clinic.status === 'active' ? '#10B98120' : '#FF6B6B20' 
                        }]}>
                            <View style={[styles.statusDot, { 
                                backgroundColor: clinic.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]} />
                            <Text style={[styles.statusBadgeText, { 
                                color: clinic.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]}>
                                {clinic.status === 'active' ? 'ACTIVE' : 'SUSPENDED'}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={[styles.clinicSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        ID: {clinic.id}
                    </Text>
                </View>
            </View>
            
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Ionicons name="medical" size={24} color={COLORS.primary} />
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {clinic.doctors}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Doctors
                    </Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]} />
                
                <View style={styles.statBox}>
                    <Ionicons name="people" size={24} color={COLORS.primary} />
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {clinic.patients}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Patients
                    </Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]} />
                
                <View style={styles.statBox}>
                    <Ionicons name="document-text" size={24} color={COLORS.primary} />
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {clinic.invoices.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Invoices
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                    { key: 'overview', label: 'Overview', icon: 'grid' },
                    { key: 'invoices', label: 'Invoices', icon: 'document-text' },
                    { key: 'patients', label: 'Patients', icon: 'people' },
                    { key: 'contact', label: 'Contact', icon: 'call' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tabButton,
                            activeTab === tab.key && styles.tabButtonActive,
                            { backgroundColor: activeTab === tab.key ? COLORS.primary : (dark ? COLORS.dark2 : COLORS.white) }
                        ]}
                        onPress={() => setActiveTab(tab.key as TabType)}
                    >
                        <Ionicons 
                            name={tab.icon as any} 
                            size={18} 
                            color={activeTab === tab.key ? COLORS.white : COLORS.primary} 
                        />
                        <Text style={[
                            styles.tabButtonText,
                            { color: activeTab === tab.key ? COLORS.white : (dark ? COLORS.white : COLORS.greyscale900) }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderOverview = () => (
        <View style={styles.contentContainer}>
            {/* Financial Overview */}
            <View style={[styles.sectionCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Financial Overview
                </Text>
                
                <View style={styles.financialGrid}>
                    <View style={[styles.financialBox, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
                        <Text style={[styles.financialLabel, { color: '#10B981' }]}>Total Paid</Text>
                        <Text style={[styles.financialValue, { color: '#10B981' }]}>${paidAmount.toLocaleString()}</Text>
                    </View>
                    
                    <View style={[styles.financialBox, { backgroundColor: '#FFA50020', borderColor: '#FFA500' }]}>
                        <Text style={[styles.financialLabel, { color: '#FFA500' }]}>Pending</Text>
                        <Text style={[styles.financialValue, { color: '#FFA500' }]}>${pendingAmount.toLocaleString()}</Text>
                    </View>
                    
                    <View style={[styles.financialBox, { backgroundColor: '#FF6B6B20', borderColor: '#FF6B6B' }]}>
                        <Text style={[styles.financialLabel, { color: '#FF6B6B' }]}>Overdue</Text>
                        <Text style={[styles.financialValue, { color: '#FF6B6B' }]}>${overdueAmount.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Manager Info */}
            <View style={[styles.sectionCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Manager Information
                </Text>
                
                <View style={styles.managerCard}>
                    <View style={[styles.managerAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                        <Ionicons name="person" size={32} color={COLORS.primary} />
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.managerName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.manager.name}
                        </Text>
                        <Text style={[styles.managerRole, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {clinic.manager.role}
                        </Text>
                        
                        <View style={styles.managerContact}>
                            <View style={styles.contactRow}>
                                <Ionicons name="mail" size={14} color={COLORS.primary} />
                                <Text style={[styles.contactText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {clinic.manager.email}
                                </Text>
                            </View>
                            <View style={styles.contactRow}>
                                <Ionicons name="call" size={14} color={COLORS.primary} />
                                <Text style={[styles.contactText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {clinic.manager.phone}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Recent Patients */}
            <View style={[styles.sectionCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        Recent Patients
                    </Text>
                    <TouchableOpacity onPress={() => setActiveTab('patients')}>
                        <Text style={[styles.seeAllText, { color: COLORS.primary }]}>See All</Text>
                    </TouchableOpacity>
                </View>
                
                {clinic.recentPatients.slice(0, 3).map((patient) => (
                    <View key={patient.id} style={styles.patientRow}>
                        <View style={[styles.patientAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                            <Ionicons name="person" size={20} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.patientName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {patient.name}
                            </Text>
                            <Text style={[styles.patientInfo, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text style={[styles.visitBadge, { color: COLORS.primary }]}>
                            {patient.totalVisits} visits
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderInvoices = () => (
        <View style={styles.contentContainer}>
            <View style={[styles.invoiceSummary, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.summaryTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Invoice Summary
                </Text>
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.invoices.length}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            Total Invoices
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                            {clinic.invoices.filter(inv => inv.status === 'paid').length}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            Paid
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#FFA500' }]}>
                            {clinic.invoices.filter(inv => inv.status === 'pending').length}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            Pending
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>
                            {clinic.invoices.filter(inv => inv.status === 'overdue').length}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            Overdue
                        </Text>
                    </View>
                </View>
            </View>

            {clinic.invoices.map((invoice) => (
                <TouchableOpacity 
                    key={invoice.id}
                    style={[styles.invoiceCard, { 
                        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                        borderColor: invoice.status === 'overdue' ? '#FF6B6B' : (dark ? COLORS.dark3 : COLORS.grayscale200)
                    }]}
                    onPress={() => {
                        setSelectedInvoice(invoice);
                        setShowInvoiceModal(true);
                    }}
                >
                    <View style={styles.invoiceHeader}>
                        <View>
                            <Text style={[styles.invoiceNumber, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {invoice.invoiceNumber}
                            </Text>
                            <Text style={[styles.invoiceDate, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Issued: {new Date(invoice.date).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View style={[styles.invoiceStatusBadge, { 
                            backgroundColor: invoice.status === 'paid' ? '#10B98120' : invoice.status === 'pending' ? '#FFA50020' : '#FF6B6B20' 
                        }]}>
                            <Text style={[styles.invoiceStatusText, { 
                                color: invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#FFA500' : '#FF6B6B' 
                            }]}>
                                {invoice.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.invoiceDetails}>
                        <View style={styles.invoiceRow}>
                            <Text style={[styles.invoiceLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Due Date:
                            </Text>
                            <Text style={[styles.invoiceValue, { 
                                color: invoice.status === 'overdue' ? '#FF6B6B' : (dark ? COLORS.white : COLORS.greyscale900) 
                            }]}>
                                {new Date(invoice.dueDate).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View style={styles.invoiceRow}>
                            <Text style={[styles.invoiceLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Amount:
                            </Text>
                            <Text style={[styles.invoiceAmount, { color: COLORS.primary }]}>
                                ${invoice.amount.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={[styles.viewInvoiceButton, { backgroundColor: COLORS.primary + '10' }]}>
                        <Text style={[styles.viewInvoiceText, { color: COLORS.primary }]}>View Invoice</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPatients = () => (
        <View style={styles.contentContainer}>
            {clinic.recentPatients.map((patient) => (
                <View key={patient.id} style={[styles.patientCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={styles.patientCardHeader}>
                        <View style={[styles.patientAvatarLarge, { backgroundColor: COLORS.primary + '20' }]}>
                            <Ionicons name="person" size={28} color={COLORS.primary} />
                        </View>
                        
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.patientCardName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {patient.name}
                            </Text>
                            <Text style={[styles.patientCardEmail, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                {patient.email}
                            </Text>
                        </View>
                        
                        <View style={[styles.patientStatus, { 
                            backgroundColor: patient.status === 'active' ? '#10B98120' : '#FF6B6B20' 
                        }]}>
                            <View style={[styles.statusDot, { 
                                backgroundColor: patient.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]} />
                            <Text style={[styles.patientStatusText, { 
                                color: patient.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]}>
                                {patient.status}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.patientStats}>
                        <View style={styles.patientStatItem}>
                            <Ionicons name="calendar" size={16} color={COLORS.primary} />
                            <Text style={[styles.patientStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Last Visit:
                            </Text>
                            <Text style={[styles.patientStatValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {new Date(patient.lastVisit).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View style={styles.patientStatItem}>
                            <Ionicons name="trending-up" size={16} color={COLORS.primary} />
                            <Text style={[styles.patientStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Total Visits:
                            </Text>
                            <Text style={[styles.patientStatValue, { color: COLORS.primary }]}>
                                {patient.totalVisits}
                            </Text>
                        </View>
                        
                        <View style={styles.patientStatItem}>
                            <Ionicons name="call" size={16} color={COLORS.primary} />
                            <Text style={[styles.patientStatLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Phone:
                            </Text>
                            <Text style={[styles.patientStatValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {patient.phone}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderContact = () => (
        <View style={styles.contentContainer}>
            <View style={[styles.sectionCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Contact Information
                </Text>
                
                <View style={styles.contactList}>
                    <TouchableOpacity style={styles.contactItem}>
                        <View style={[styles.contactIconBox, { backgroundColor: COLORS.primary + '20' }]}>
                            <Ionicons name="call" size={24} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.contactLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Phone Number
                            </Text>
                            <Text style={[styles.contactValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {clinic.contact.phone}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.contactItem}>
                        <View style={[styles.contactIconBox, { backgroundColor: '#4ECDC420' }]}>
                            <Ionicons name="mail" size={24} color="#4ECDC4" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.contactLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Email Address
                            </Text>
                            <Text style={[styles.contactValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {clinic.contact.email}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.contactItem}>
                        <View style={[styles.contactIconBox, { backgroundColor: '#FFD93D20' }]}>
                            <Ionicons name="location" size={24} color="#FFD93D" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.contactLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                Address
                            </Text>
                            <Text style={[styles.contactValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {clinic.contact.address}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                    
                    {clinic.contact.website && (
                        <TouchableOpacity style={styles.contactItem}>
                            <View style={[styles.contactIconBox, { backgroundColor: '#9B59B620' }]}>
                                <Ionicons name="globe" size={24} color="#9B59B6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.contactLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                    Website
                                </Text>
                                <Text style={[styles.contactValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {clinic.contact.website}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    )}
                    
                    {clinic.contact.emergencyContact && (
                        <TouchableOpacity style={styles.contactItem}>
                            <View style={[styles.contactIconBox, { backgroundColor: '#FF6B6B20' }]}>
                                <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.contactLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                    Emergency Contact
                                </Text>
                                <Text style={[styles.contactValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {clinic.contact.emergencyContact}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            {/* Manager Card */}
            <View style={[styles.sectionCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Manager Contact
                </Text>
                
                <View style={styles.managerContactCard}>
                    <View style={[styles.managerAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                        <Ionicons name="person" size={32} color={COLORS.primary} />
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.managerName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.manager.name}
                        </Text>
                        <Text style={[styles.managerRole, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {clinic.manager.role}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.managerActions}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="call" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]}>
                        <Ionicons name="mail" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Email</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FFD93D' }]}>
                        <Ionicons name="chatbubble" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderInvoiceModal = () => {
        if (!selectedInvoice) return null;
        
        return (
            <Modal
                visible={showInvoiceModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowInvoiceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                Invoice Details
                            </Text>
                            <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                                <Ionicons name="close-circle" size={28} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[styles.invoiceModalCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite }]}>
                                <Text style={[styles.invoiceModalNumber, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {selectedInvoice.invoiceNumber}
                                </Text>
                                
                                <View style={styles.invoiceModalRow}>
                                    <Text style={[styles.invoiceModalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Issued Date:
                                    </Text>
                                    <Text style={[styles.invoiceModalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                        {new Date(selectedInvoice.date).toLocaleDateString()}
                                    </Text>
                                </View>
                                
                                <View style={styles.invoiceModalRow}>
                                    <Text style={[styles.invoiceModalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Due Date:
                                    </Text>
                                    <Text style={[styles.invoiceModalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                
                                <View style={styles.invoiceModalRow}>
                                    <Text style={[styles.invoiceModalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                        Status:
                                    </Text>
                                    <View style={[styles.invoiceStatusBadge, { 
                                        backgroundColor: selectedInvoice.status === 'paid' ? '#10B98120' : selectedInvoice.status === 'pending' ? '#FFA50020' : '#FF6B6B20' 
                                    }]}>
                                        <Text style={[styles.invoiceStatusText, { 
                                            color: selectedInvoice.status === 'paid' ? '#10B981' : selectedInvoice.status === 'pending' ? '#FFA500' : '#FF6B6B' 
                                        }]}>
                                            {selectedInvoice.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={[styles.invoiceItemsCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite }]}>
                                <Text style={[styles.invoiceItemsTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    Invoice Items
                                </Text>
                                
                                {selectedInvoice.items.map((item, index) => (
                                    <View key={index} style={styles.invoiceItem}>
                                        <Text style={[styles.invoiceItemDescription, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            {item.description}
                                        </Text>
                                        <Text style={[styles.invoiceItemAmount, { color: COLORS.primary }]}>
                                            ${item.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                ))}
                                
                                <View style={[styles.invoiceTotal, { borderTopColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}>
                                    <Text style={[styles.invoiceTotalLabel, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                        Total Amount:
                                    </Text>
                                    <Text style={[styles.invoiceTotalAmount, { color: COLORS.primary }]}>
                                        ${selectedInvoice.amount.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                        
                        <View style={styles.modalActions}>
                            <Button 
                                title="Download Invoice" 
                                filled 
                                style={{ flex: 1 }}
                                onPress={() => {}}
                            />
                            {selectedInvoice.status !== 'paid' && (
                                <Button 
                                    title="Mark as Paid" 
                                    style={{ flex: 1, backgroundColor: '#10B981' }}
                                    onPress={() => setShowInvoiceModal(false)}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                {renderClinicHeader()}
                {renderTabs()}
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'invoices' && renderInvoices()}
                    {activeTab === 'patients' && renderPatients()}
                    {activeTab === 'contact' && renderContact()}
                </ScrollView>
                
                {renderInvoiceModal()}
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
    
    // Clinic Header
    clinicHeader: { borderRadius: 16, padding: 20, marginBottom: 16 },
    clinicHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    clinicLogo: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    clinicLogoText: { fontSize: 24, fontFamily: 'bold' },
    clinicName: { fontSize: 20, fontFamily: 'bold', marginBottom: 4 },
    clinicSubtitle: { fontSize: 13, fontFamily: 'regular' },
    statusBadgeLarge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusBadgeText: { fontSize: 12, fontFamily: 'bold' },
    
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.grayscale200 },
    statBox: { alignItems: 'center' },
    statValue: { fontSize: 24, fontFamily: 'bold', marginTop: 8, marginBottom: 4 },
    statLabel: { fontSize: 12, fontFamily: 'regular' },
    statDivider: { width: 1 },
    
    // Tabs
    tabsContainer: { marginBottom: 16 },
    tabButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: COLORS.grayscale200 },
    tabButtonActive: { borderColor: COLORS.primary },
    tabButtonText: { fontSize: 14, fontFamily: 'semibold' },
    
    // Content
    contentContainer: { paddingBottom: 20 },
    sectionCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontFamily: 'bold', marginBottom: 16 },
    seeAllText: { fontSize: 14, fontFamily: 'semibold' },
    
    // Financial
    financialGrid: { flexDirection: 'row', gap: 12 },
    financialBox: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
    financialLabel: { fontSize: 12, fontFamily: 'medium', marginBottom: 8 },
    financialValue: { fontSize: 20, fontFamily: 'bold' },
    
    // Manager
    managerCard: { flexDirection: 'row', gap: 16 },
    managerAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    managerName: { fontSize: 18, fontFamily: 'bold', marginBottom: 4 },
    managerRole: { fontSize: 13, fontFamily: 'regular', marginBottom: 12 },
    managerContact: { gap: 8 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactText: { fontSize: 13, fontFamily: 'regular' },
    
    // Patients
    patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.grayscale200 },
    patientAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    patientName: { fontSize: 15, fontFamily: 'semibold', marginBottom: 2 },
    patientInfo: { fontSize: 12, fontFamily: 'regular' },
    visitBadge: { fontSize: 12, fontFamily: 'bold' },
    
    patientCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
    patientCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    patientAvatarLarge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    patientCardName: { fontSize: 16, fontFamily: 'bold', marginBottom: 4 },
    patientCardEmail: { fontSize: 13, fontFamily: 'regular' },
    patientStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    patientStatusText: { fontSize: 11, fontFamily: 'bold' },
    patientStats: { gap: 12 },
    patientStatItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    patientStatLabel: { fontSize: 13, fontFamily: 'regular' },
    patientStatValue: { fontSize: 13, fontFamily: 'semibold' },
    
    // Invoices
    invoiceSummary: { borderRadius: 16, padding: 16, marginBottom: 16 },
    summaryTitle: { fontSize: 16, fontFamily: 'bold', marginBottom: 16 },
    summaryGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    summaryValue: { fontSize: 24, fontFamily: 'bold', marginBottom: 4 },
    summaryLabel: { fontSize: 12, fontFamily: 'regular' },
    
    invoiceCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
    invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    invoiceNumber: { fontSize: 16, fontFamily: 'bold', marginBottom: 4 },
    invoiceDate: { fontSize: 12, fontFamily: 'regular' },
    invoiceStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    invoiceStatusText: { fontSize: 11, fontFamily: 'bold' },
    invoiceDetails: { gap: 8, marginBottom: 12 },
    invoiceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    invoiceLabel: { fontSize: 13, fontFamily: 'regular' },
    invoiceValue: { fontSize: 13, fontFamily: 'semibold' },
    invoiceAmount: { fontSize: 18, fontFamily: 'bold' },
    viewInvoiceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
    viewInvoiceText: { fontSize: 14, fontFamily: 'semibold' },
    
    // Contact
    contactList: { gap: 12 },
    contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.grayscale200 },
    contactIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    contactLabel: { fontSize: 12, fontFamily: 'regular', marginBottom: 4 },
    contactValue: { fontSize: 14, fontFamily: 'semibold' },
    
    managerContactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    managerActions: { flexDirection: 'row', gap: 12 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
    actionButtonText: { fontSize: 14, fontFamily: 'semibold', color: COLORS.white },
    
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontFamily: 'bold' },
    
    invoiceModalCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
    invoiceModalNumber: { fontSize: 18, fontFamily: 'bold', marginBottom: 16 },
    invoiceModalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    invoiceModalLabel: { fontSize: 14, fontFamily: 'regular' },
    invoiceModalValue: { fontSize: 14, fontFamily: 'semibold' },
    
    invoiceItemsCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
    invoiceItemsTitle: { fontSize: 16, fontFamily: 'bold', marginBottom: 16 },
    invoiceItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    invoiceItemDescription: { fontSize: 14, fontFamily: 'regular', flex: 1 },
    invoiceItemAmount: { fontSize: 14, fontFamily: 'bold' },
    invoiceTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, marginTop: 16, borderTopWidth: 2 },
    invoiceTotalLabel: { fontSize: 16, fontFamily: 'bold' },
    invoiceTotalAmount: { fontSize: 20, fontFamily: 'bold' },
    
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
});

export default ClinicDetails;
