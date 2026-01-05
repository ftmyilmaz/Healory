import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../../constants';

const AdminSettings = () => {
    const router = useRouter();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { 
                    text: 'Çıkış Yap', 
                    style: 'destructive',
                    onPress: () => {
                        router.replace('/adminlogin');
                    }
                },
            ]
        );
    };

    const settingsOptions = [
        {
            id: 'profile',
            title: 'Profil Düzenle',
            icon: 'person-outline',
            onPress: () => {},
        },
        {
            id: 'security',
            title: 'Şifre Değiştir',
            icon: 'lock-closed-outline',
            onPress: () => {},
        },
        {
            id: 'privacy',
            title: 'Gizlilik Politikası',
            icon: 'shield-checkmark-outline',
            onPress: () => {
                router.push('/settingsprivacypolicy');
            },
        },
        {
            id: 'about',
            title: 'Hakkında',
            icon: 'information-circle-outline',
            onPress: () => {},
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Ayarları</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BİLDİRİMLER</Text>
                    
                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.settingTitle}>Push Bildirimleri</Text>
                        </View>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                            thumbColor={COLORS.white}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="mail-outline" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.settingTitle}>E-posta Bildirimleri</Text>
                        </View>
                        <Switch
                            value={emailNotifications}
                            onValueChange={setEmailNotifications}
                            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                            thumbColor={COLORS.white}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AYARLAR</Text>
                    {settingsOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.settingItem}
                            onPress={option.onPress}
                        >
                            <View style={styles.settingLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={option.icon}
                                        size={22}
                                        color={COLORS.primary}
                                    />
                                </View>
                                <Text style={styles.settingTitle}>
                                    {option.title}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={COLORS.gray}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayscale200,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingTop: 8,
    },
    section: {
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray,
        paddingHorizontal: 16,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayscale200,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.tansparentPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        marginHorizontal: 16,
        marginTop: 32,
        marginBottom: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginLeft: 8,
    },
});

export default AdminSettings;
