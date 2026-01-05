import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import Input from '../components/Input';
import { COLORS, icons, images, SIZES } from '../constants';
import { authService } from '../services/auth/AuthService';
import { logger } from '../services/logging/Logger';
import { navigationService, ROUTES } from '../services/navigation/NavigationService';
import { useTheme } from '../theme/ThemeProvider';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducers';

const isTestMode = true;

const initialState = {
    inputValues: {
        email: isTestMode ? 'admin@medico.com' : '',
        password: isTestMode ? 'admin123' : '',
    },
    inputValidities: {
        email: false,
        password: false
    },
    formIsValid: false,
}

type Nav = {
    navigate: (value: string) => void
}

const AdminLogin = () => {
    console.log('🎯 [AdminLogin] Component rendered');
    
    const { colors, dark } = useTheme();
    const router = useRouter();
    const [formState, dispatchFormState] = useReducer(reducer, initialState);
    const [error, setError] = useState(null);
    const [isChecked, setChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inputChangedHandler = useCallback(
        (inputId: string, inputValue: string) => {
            const result = validateInput(inputId, inputValue)
            dispatchFormState({
                inputId,
                validationResult: result,
                inputValue,
            })
        }, [dispatchFormState]);

    useEffect(() => {
        console.log('✅ [AdminLogin] Component mounted');
        logger.info('ADMIN_LOGIN', 'Admin Login screen mounted');
        navigationService.setRouter(router);

        return () => {
            console.log('❌ [AdminLogin] Component unmounting');
            logger.info('ADMIN_LOGIN', 'Admin Login screen unmounted');
        };
    }, [router]);

    useEffect(() => {
        if (error) {
            Alert.alert('An error occured', error)
        }
    }, [error]);

    const handleLogin = async () => {
        console.log('🔐 [AdminLogin] Login button clicked');
        logger.info('ADMIN_LOGIN', 'Login button pressed');

        const email = formState.inputValues.email;
        const password = formState.inputValues.password;

        console.log('📧 [AdminLogin] Email:', email);
        console.log('🔑 [AdminLogin] Password length:', password.length);

        if (!email || !password) {
            console.warn('⚠️ [AdminLogin] Missing email or password');
            logger.warn('ADMIN_LOGIN', 'Login attempt with empty fields');
            Alert.alert('Validation Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);
        console.log('⏳ [AdminLogin] Logging in...');
        logger.info('ADMIN_LOGIN', 'Starting authentication process', { email });

        try {
            const response = await authService.loginAdmin({ email, password });
            console.log('✅ [AdminLogin] Login response:', JSON.stringify(response, null, 2));

            if (response.success && response.user) {
                logger.success('ADMIN_LOGIN', 'Authentication successful', {
                    userId: response.user.id,
                    role: response.user.role
                });

                logger.info('ADMIN_LOGIN', 'Navigating to admin dashboard');
                console.log('✅ [AdminLogin] User is admin, navigating to dashboard');
                console.log('🚀 [AdminLogin] Calling router.push("/admindashboard")');
                
                navigationService.navigate(ROUTES.ADMIN.DASHBOARD);
                
                console.log('✅ [AdminLogin] router.push called successfully');

            } else {
                console.warn('⚠️ [AdminLogin] User is not admin, role:', response.user?.role);
                logger.warn('ADMIN_LOGIN', 'Authentication failed', { error: response.error });
                Alert.alert('Login Failed', response.error || 'Invalid admin credentials');
            }
        } catch (error) {
            console.error('❌ [AdminLogin] Login error:', error);
            logger.error('ADMIN_LOGIN', 'Login error occurred', error);
            Alert.alert('Error', 'An unexpected error occurred during login');
        } finally {
            setIsLoading(false);
            console.log('🏁 [AdminLogin] Login process completed');
            logger.debug('ADMIN_LOGIN', 'Login process completed');
        }
    };

    return (
        <SafeAreaView style={[styles.area, {
            backgroundColor: colors.background
        }]}>
            <View style={[styles.container, {
                backgroundColor: colors.background
            }]}>
                <Header title="" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={images.logo}
                            resizeMode='contain'
                            style={styles.logo}
                        />
                    </View>
                    <Text style={[styles.title, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>Admin Login</Text>
                    <Text style={[styles.subtitle, {
                        color: dark ? COLORS.grayscale400 : COLORS.grayscale700
                    }]}>Access Administrative Panel</Text>
                    <Input
                        id="email"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['email']}
                        placeholder="Admin Email"
                        placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
                        icon={icons.email}
                        keyboardType="email-address"
                    />
                    <Input
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['password']}
                        autoCapitalize="none"
                        id="password"
                        placeholder="Admin Password"
                        placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
                        icon={icons.padlock}
                        secureTextEntry={true}
                    />
                    <View style={styles.checkBoxContainer}>
                        <Checkbox
                            style={styles.checkbox}
                            value={isChecked}
                            color={isChecked ? COLORS.primary : dark ? COLORS.primary : "gray"}
                            onValueChange={setChecked}
                        />
                        <Text style={[styles.privacy, {
                            color: dark ? COLORS.white : COLORS.black
                        }]}>Remember me</Text>
                    </View>
                    <Button
                        title={isLoading ? "Logging in..." : "Login as Admin"}
                        filled
                        onPress={handleLogin}
                        style={styles.button}
                        disabled={isLoading}
                    />
                </ScrollView>
                <View style={styles.bottomContainer}>
                    <Text style={[styles.bottomLeft, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}>Not an admin?</Text>
                    <TouchableOpacity
                        onPress={() => {
                            logger.info('ADMIN_LOGIN', 'Navigating to user login');
                            navigationService.navigate(ROUTES.AUTH.LOGIN);
                        }}>
                        <Text style={styles.bottomRight}>{"  "}User Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.white
    },
    logo: {
        width: 100,
        height: 100,
        tintColor: COLORS.primary
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 32
    },
    title: {
        fontSize: 26,
        fontFamily: "bold",
        color: COLORS.black,
        textAlign: "center",
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "regular",
        color: COLORS.grayscale700,
        textAlign: "center",
        marginBottom: 22
    },
    checkBoxContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 18,
        width: "100%",
    },
    checkbox: {
        marginRight: 8,
        height: 16,
        width: 16,
        borderRadius: 4,
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    privacy: {
        fontSize: 12,
        fontFamily: "regular",
        color: COLORS.black,
    },
    bottomContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 18,
        position: "absolute",
        bottom: 12,
        right: 0,
        left: 0,
    },
    bottomLeft: {
        fontSize: 14,
        fontFamily: "regular",
        color: "black"
    },
    bottomRight: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.primary
    },
    button: {
        marginVertical: 6,
        width: SIZES.width - 32,
        borderRadius: 30
    }
})

export default AdminLogin
