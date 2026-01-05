import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

interface Invoice {
    id: string;
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

interface Doctor {
    id: string;
    name: string;
    specialization: string;
    email: string;
    phone: string;
    patients: number;
    rating: number;
}

interface Manager {
    name: string;
    email: string;
    phone: string;
    position: string;
    joinedDate: string;
}

interface ClinicDetails {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    status: 'active' | 'suspended';
    registeredDate: string;
    contractStartDate: string;
    manager: Manager;
    invoices: Invoice[];
    patients: Patient[];
    doctors: Doctor[];
}

const mockClinicDetails: ClinicDetails = {
    id: '1',
    name: 'Central Medical Clinic',
    address: '123 Main Street, New York, NY 10001',
    phone: '+1 234 567 8900',
    email: 'central@clinic.com',
    website: 'www.centralmedical.com',
    status: 'active',
    registeredDate: '2025-01-15',
    contractStartDate: '2025-02-01',
    manager: {
        name: 'John Smith',
        email: 'john.smith@clinic.com',
        phone: '+1 234 567 8901',
        position: 'Clinic Manager',
        joinedDate: '2025-01-15'
    },
    invoices: [
        { id: 'INV-001', invoiceNumber: 'INV-2026-01-001', month: 'January', year: 2026, issueDate: '2026-01-01', dueDate: '2026-01-31', patients: 1250, pricePerPatient: 5, subtotal: 6250, tax: 625, discount: 312.5, total: 6562.5, status: 'pending' },
        { id: 'INV-002', invoiceNumber: 'INV-2025-12-002', month: 'December', year: 2025, issueDate: '2025-12-01', dueDate: '2025-12-31', patients: 1200, pricePerPatient: 5, subtotal: 6000, tax: 600, discount: 300, total: 6300, status: 'paid' },
        { id: 'INV-003', invoiceNumber: 'INV-2025-11-003', month: 'November', year: 2025, issueDate: '2025-11-01', dueDate: '2025-11-30', patients: 1180, pricePerPatient: 5, subtotal: 5900, tax: 590, discount: 295, total: 6195, status: 'paid' },
    ],
    patients: [
        { id: 'P1', name: 'Alice Johnson', email: 'alice@email.com', phone: '+1 234 567 8910', lastVisit: '2026-01-03', totalVisits: 5, status: 'active' },
        { id: 'P2', name: 'Bob Williams', email: 'bob@email.com', phone: '+1 234 567 8911', lastVisit: '2026-01-02', totalVisits: 3, status: 'active' },
        { id: 'P3', name: 'Carol Davis', email: 'carol@email.com', phone: '+1 234 567 8912', lastVisit: '2025-12-15', totalVisits: 8, status: 'inactive' },
    ],
    doctors: [
        { id: 'D1', name: 'Dr. Emily Brown', specialization: 'Cardiology', email: 'emily@clinic.com', phone: '+1 234 567 8920', patients: 450, rating: 4.8 },
        { id: 'D2', name: 'Dr. Michael Chen', specialization: 'Neurology', email: 'michael@clinic.com', phone: '+1 234 567 8921', patients: 380, rating: 4.9 },
        { id: 'D3', name: 'Dr. Sarah Wilson', specialization: 'Pediatrics', email: 'sarah@clinic.com', phone: '+1 234 567 8922', patients: 420, rating: 4.7 },
    ]
};

const ClinicDetails = () => {
    const router = useRouter();
    const { colors, dark } = useTheme();
    const params = useLocalSearchParams();
    
    const [activeSection, setActiveSection] = useState<'overview' | 'invoices' | 'patients' | 'doctors' | 'contact'>('overview');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const clinic = mockClinicDetails; // In real app, fetch by params.id

    const renderOverview = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
                        <Ionicons name="people" size={24} color="#10B981" />
                    </View>
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {clinic.patients.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Total Patients
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                        <Ionicons name="medical" size={24} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {clinic.doctors.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Doctors
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#FFD93D20' }]}>
                        <Ionicons name="document-text" size={24} color="#FFD93D" />
                    </View>
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        {clinic.invoices.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Invoices
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#4ECDC420' }]}>
                        <Ionicons name="cash" size={24} color="#4ECDC4" />
                    </View>
                    <Text style={[styles.statValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                        ${clinic.invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                        Total Revenue
                    </Text>
                </View>
            </View>

            {/* Clinic Info */}
            <View style={[styles.section, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Clinic Information
                </Text>
                
                <View style={styles.infoRow}>
                    <Ionicons name="business" size={20} color={COLORS.primary} />
                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Name:</Text>
                    <Text style={[styles.infoValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Address:</Text>
                    <Text style={[styles.infoValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.address}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Phone:</Text>
                    <Text style={[styles.infoValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.phone}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="mail" size={20} color={COLORS.primary} />
                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Email:</Text>
                    <Text style={[styles.infoValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.email}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="globe" size={20} color={COLORS.primary} />
                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Website:</Text>
                    <Text style={[styles.infoValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{clinic.website}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Registered:</Text>
                    <Text style={[styles.infoValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{new Date(clinic.registeredDate).toLocaleDateString()}</Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderInvoices = () => (
        <View style={{ flex: 1 }}>
            <FlatList
                data={clinic.invoices}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[styles.invoiceCard, { 
                            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                            borderLeftWidth: 4,
                            borderLeftColor: item.status === 'paid' ? '#10B981' : item.status === 'pending' ? '#FFD93D' : '#FF6B6B'
                        }]}
                        onPress={() => {
                            setSelectedInvoice(item);
                            setShowInvoiceModal(true);
                        }}
                    >
                        <View style={styles.invoiceHeader}>
                            <View>
                                <Text style={[styles.invoiceNumber, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    {item.invoiceNumber}
                                </Text>
                                <Text style={[styles.invoiceDate, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                    {item.month} {item.year}
                                </Text>
                            </View>
                            <View style={[styles.invoiceStatus, { 
                                backgroundColor: item.status === 'paid' ? '#10B98120' : item.status === 'pending' ? '#FFD93D20' : '#FF6B6B20'
                            }]}>
                                <Text style={[styles.invoiceStatusText, { 
                                    color: item.status === 'paid' ? '#10B981' : item.status === 'pending' ? '#FFD93D' : '#FF6B6B'
                                }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.invoiceDetails}>
                            <View style={styles.invoiceRow}>
                                <Text style={[styles.invoiceLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Patients:</Text>
                                <Text style={[styles.invoiceValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{item.patients}</Text>
                            </View>
                            <View style={styles.invoiceRow}>
                                <Text style={[styles.invoiceLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Subtotal:</Text>
                                <Text style={[styles.invoiceValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>${item.subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.invoiceRow}>
                                <Text style={[styles.invoiceLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Tax (10%):</Text>
                                <Text style={[styles.invoiceValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>${item.tax.toFixed(2)}</Text>
                            </View>
                            <View style={styles.invoiceRow}>
                                <Text style={[styles.invoiceLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Discount:</Text>
                                <Text style={[styles.invoiceValue, { color: '#10B981' }]}>-${item.discount.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.invoiceRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}>
                                <Text style={[styles.invoiceTotalLabel, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Total:</Text>
                                <Text style={[styles.invoiceTotalValue, { color: COLORS.primary }]}>${item.total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderPatients = () => (
        <FlatList
            data={clinic.patients}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                                {item.email}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { 
                            backgroundColor: item.status === 'active' ? '#10B98120' : '#FF6B6B20' 
                        }]}>
                            <Text style={[styles.statusText, { 
                                color: item.status === 'active' ? '#10B981' : '#FF6B6B' 
                            }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                        <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {item.phone}
                        </Text>
                    </View>
                    <View style={styles.patientStats}>
                        <Text style={[styles.patientStatText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            Last visit: {new Date(item.lastVisit).toLocaleDateString()}
                        </Text>
                        <Text style={[styles.patientStatText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            Total visits: {item.totalVisits}
                        </Text>
                    </View>
                </View>
            )}
        />
    );

    const renderDoctors = () => (
        <FlatList
            data={clinic.doctors}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: COLORS.primary }]}>
                                {item.specialization}
                            </Text>
                        </View>
                        <View style={[styles.ratingBadge, { backgroundColor: '#FFD93D20' }]}>
                            <Ionicons name="star" size={14} color="#FFD93D" />
                            <Text style={[styles.ratingText, { color: '#FFD93D' }]}>
                                {item.rating}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                        <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {item.email}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                        <Text style={[styles.infoText, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {item.phone}
                        </Text>
                    </View>
                    <View style={[styles.doctorStat, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale100 }]}>
                        <Ionicons name="people" size={16} color={COLORS.primary} />
                        <Text style={[styles.doctorStatText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {item.patients} Patients
                        </Text>
                    </View>
                </View>
            )}
        />
    );

    const renderContact = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.section, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                    Clinic Manager
                </Text>
                
                <View style={styles.managerCard}>
                    <View style={[styles.managerAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                        <Text style={[styles.managerInitials, { color: COLORS.primary }]}>
                            {clinic.manager.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.managerName, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.manager.name}
                        </Text>
                        <Text style={[styles.managerPosition, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
                            {clinic.manager.position}
                        </Text>
                    </View>
                </View>

                <View style={styles.contactInfo}>
                    <View style={styles.contactRow}>
                        <Ionicons name="mail" size={20} color={COLORS.primary} />
                        <Text style={[styles.contactText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.manager.email}
                        </Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Ionicons name="call" size={20} color={COLORS.primary} />
                        <Text style={[styles.contactText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            {clinic.manager.phone}
                        </Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Ionicons name="calendar" size={20} color={COLORS.primary} />
                        <Text style={[styles.contactText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                            Joined: {new Date(clinic.manager.joinedDate).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="mail" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Send Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]}>
                        <Ionicons name="call" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Call Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title={clinic.name} />

                {/* Status Badge */}
                <View style={[styles.headerBadge, { 
                    backgroundColor: clinic.status === 'active' ? '#10B98120' : '#FF6B6B20' 
                }]}>
                    <View style={[styles.statusDot, { 
                        backgroundColor: clinic.status === 'active' ? '#10B981' : '#FF6B6B' 
                    }]} />
                    <Text style={[styles.headerBadgeText, { 
                        color: clinic.status === 'active' ? '#10B981' : '#FF6B6B' 
                    }]}>
                        {clinic.status.toUpperCase()}
                    </Text>
                </View>

                {/* Navigation Tabs */}
                <View style={styles.navContainer}>
                    {[
                        { key: 'overview', label: 'Overview', icon: 'grid-outline' },
                        { key: 'invoices', label: 'Invoices', icon: 'document-text-outline' },
                        { key: 'patients', label: 'Patients', icon: 'people-outline' },
                        { key: 'doctors', label: 'Doctors', icon: 'medical-outline' },
                        { key: 'contact', label: 'Contact', icon: 'call-outline' },
                    ].map((section) => (
                        <TouchableOpacity
                            key={section.key}
                            style={styles.navTab}
                            onPress={() => setActiveSection(section.key as any)}
                        >
                            <Ionicons 
                                name={section.icon as any} 
                                size={24} 
                                color={activeSection === section.key ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray)} 
                            />
                            <Text style={[
                                styles.navTabText,
                                { color: activeSection === section.key ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray) }
                            ]}>
                                {section.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                <View style={{ flex: 1, marginTop: 12 }}>
                    {activeSection === 'overview' && renderOverview()}
                    {activeSection === 'invoices' && renderInvoices()}
                    {activeSection === 'patients' && renderPatients()}
                    {activeSection === 'doctors' && renderDoctors()}
                    {activeSection === 'contact' && renderContact()}
                </View>

                {/* Invoice Detail Modal */}
                <Modal visible={showInvoiceModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                    Invoice Details
                                </Text>
                                <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                                    <Ionicons name="close-circle" size={28} color={dark ? COLORS.grayscale400 : COLORS.gray} />
                                </TouchableOpacity>
                            </View>

                            {selectedInvoice && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={[styles.modalSection, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}>
                                        <Text style={[styles.modalInvoiceNumber, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            {selectedInvoice.invoiceNumber}
                                        </Text>
                                        <View style={[styles.invoiceStatus, { 
                                            backgroundColor: selectedInvoice.status === 'paid' ? '#10B98120' : selectedInvoice.status === 'pending' ? '#FFD93D20' : '#FF6B6B20'
                                        }]}>
                                            <Text style={[styles.invoiceStatusText, { 
                                                color: selectedInvoice.status === 'paid' ? '#10B981' : selectedInvoice.status === 'pending' ? '#FFD93D' : '#FF6B6B'
                                            }]}>
                                                {selectedInvoice.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Period:</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                {selectedInvoice.month} {selectedInvoice.year}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Issue Date:</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Due Date:</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.modalSection, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}>
                                        <Text style={[styles.modalSectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                            Billing Details
                                        </Text>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Patients:</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                {selectedInvoice.patients}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Price per Patient:</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                ${selectedInvoice.pricePerPatient.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Subtotal:</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                ${selectedInvoice.subtotal.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Tax (10%):</Text>
                                            <Text style={[styles.modalValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                                                ${selectedInvoice.tax.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={[styles.modalLabel, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>Discount:</Text>
                                            <Text style={[styles.modalValue, { color: '#10B981' }]}>
                                                -${selectedInvoice.discount.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={[styles.modalRow, { paddingTop: 12, borderTopWidth: 2, borderTopColor: dark ? COLORS.dark3 : COLORS.grayscale200, marginTop: 12 }]}>
                                            <Text style={[styles.modalTotalLabel, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Total Amount:</Text>
                                            <Text style={[styles.modalTotalValue, { color: COLORS.primary }]}>
                                                ${selectedInvoice.total.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: { flex: 1 },
    container: { flex: 1, padding: 16 },
    
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16
    },
    headerBadgeText: {
        fontSize: 12,
        fontFamily: 'bold'
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        backgroundColor: 'transparent',
        borderRadius: 0,
        marginBottom: 12,
        gap: 4
    },
    navTab: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 12,
        gap: 4
    },
    navTabText: {
        fontSize: 11,
        fontFamily: 'semiBold',
        letterSpacing: 0,
        marginTop: 2
    },
    
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
    },
    statValue: {
        fontSize: 24,
        fontFamily: 'bold',
        marginBottom: 4
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'regular',
        textAlign: 'center'
    },
    
    section: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'bold',
        marginBottom: 16
    },
    
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12
    },
    infoLabel: {
        fontSize: 13,
        fontFamily: 'medium',
        minWidth: 80
    },
    infoValue: {
        fontSize: 13,
        fontFamily: 'regular',
        flex: 1
    },
    infoText: {
        fontSize: 12,
        fontFamily: 'regular'
    },
    
    invoiceCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    invoiceNumber: {
        fontSize: 16,
        fontFamily: 'bold',
        marginBottom: 4
    },
    invoiceDate: {
        fontSize: 12,
        fontFamily: 'regular'
    },
    invoiceStatus: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20
    },
    invoiceStatusText: {
        fontSize: 11,
        fontFamily: 'bold'
    },
    invoiceDetails: {
        gap: 6
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    invoiceLabel: {
        fontSize: 13,
        fontFamily: 'regular'
    },
    invoiceValue: {
        fontSize: 13,
        fontFamily: 'medium'
    },
    invoiceTotalLabel: {
        fontSize: 15,
        fontFamily: 'bold'
    },
    invoiceTotalValue: {
        fontSize: 18,
        fontFamily: 'bold'
    },
    
    card: {
        borderRadius: 12,
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
        fontSize: 16,
        fontFamily: 'bold',
        marginBottom: 4
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: 'regular'
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'bold',
        textTransform: 'capitalize'
    },
    
    patientStats: {
        marginTop: 8,
        gap: 4
    },
    patientStatText: {
        fontSize: 12,
        fontFamily: 'regular'
    },
    
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20
    },
    ratingText: {
        fontSize: 12,
        fontFamily: 'bold'
    },
    doctorStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8
    },
    doctorStatText: {
        fontSize: 13,
        fontFamily: 'medium'
    },
    
    managerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16
    },
    managerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    managerInitials: {
        fontSize: 22,
        fontFamily: 'bold'
    },
    managerName: {
        fontSize: 18,
        fontFamily: 'bold',
        marginBottom: 4
    },
    managerPosition: {
        fontSize: 13,
        fontFamily: 'regular'
    },
    
    contactInfo: {
        gap: 12,
        marginBottom: 16
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    contactText: {
        fontSize: 14,
        fontFamily: 'regular'
    },
    
    actionButtons: {
        flexDirection: 'row',
        gap: 12
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontFamily: 'semiBold'
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'bold'
    },
    modalSection: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16
    },
    modalInvoiceNumber: {
        fontSize: 18,
        fontFamily: 'bold',
        marginBottom: 8
    },
    modalSectionTitle: {
        fontSize: 16,
        fontFamily: 'bold',
        marginBottom: 12
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    modalLabel: {
        fontSize: 14,
        fontFamily: 'regular'
    },
    modalValue: {
        fontSize: 14,
        fontFamily: 'medium'
    },
    modalTotalLabel: {
        fontSize: 16,
        fontFamily: 'bold'
    },
    modalTotalValue: {
        fontSize: 20,
        fontFamily: 'bold'
    }
});

export default ClinicDetails;
