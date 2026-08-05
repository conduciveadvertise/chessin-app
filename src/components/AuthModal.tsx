import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  X,
  ShieldCheck,
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Globe,
} from "lucide-react-native";
import { authService, useAuth } from "../services/authService";
import { isSupabaseConfigured } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isLoading, error: authError } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLocalError(null);
    setSuccessMessage(null);

    try {
      if (mode === "signin") {
        if (!email || !password) {
          setLocalError("Please enter your email and password.");
          return;
        }
        await authService.signInWithEmail(email, password);
        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (mode === "signup") {
        if (!email || !password || !displayName) {
          setLocalError("All fields are required for sign up.");
          return;
        }
        if (password.length < 6) {
          setLocalError("Password must be at least 6 characters.");
          return;
        }
        await authService.signUpWithEmail(email, password, displayName);
        setSuccessMessage("Account created! Please check your email for verification.");
      } else if (mode === "forgot") {
        if (!email) {
          setLocalError("Please enter your email address.");
          return;
        }
        await authService.resetPassword(email);
        setSuccessMessage("Password reset instructions sent to your email.");
      }
    } catch (err: any) {
      setLocalError(err.message || "An authentication error occurred.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || "Google sign-in failed.");
    }
  };

  const handleGuestLogin = async () => {
    setLocalError(null);
    try {
      await authService.signInAsGuest();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || "Guest login failed.");
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={18} color="#A1A1AA" />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.badge}>
              <ShieldCheck size={14} color="#D4AF37" />
              <Text style={styles.badgeText}>CHESS.IN PASSPORT</Text>
            </View>
            <Text style={styles.title}>
              {mode === "signin" && "Welcome Back, Master"}
              {mode === "signup" && "Join the Elite Arena"}
              {mode === "forgot" && "Reset Password"}
            </Text>
            <Text style={styles.subtitle}>
              {mode === "signin" && "Sign in to access ratings, history, and rankings"}
              {mode === "signup" && "Create an official FIDE-style player passport"}
              {mode === "forgot" && "Enter your email to receive reset instructions"}
            </Text>
          </View>

          {!isSupabaseConfigured && (
            <View style={styles.noticeBox}>
              <AlertCircle size={16} color="#FBBF24" />
              <Text style={styles.noticeText}>
                Supabase credentials not configured. You can test Guest Mode.
              </Text>
            </View>
          )}

          {/* Mode Tabs */}
          <View style={styles.modeTabs}>
            <Pressable
              onPress={() => {
                setMode("signin");
                setLocalError(null);
                setSuccessMessage(null);
              }}
              style={[styles.modeTab, mode === "signin" && styles.activeModeTab]}
            >
              <Text style={[styles.modeTabText, mode === "signin" && styles.activeModeTabText]}>
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode("signup");
                setLocalError(null);
                setSuccessMessage(null);
              }}
              style={[styles.modeTab, mode === "signup" && styles.activeModeTab]}
            >
              <Text style={[styles.modeTabText, mode === "signup" && styles.activeModeTabText]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Alerts */}
          {Boolean(localError || authError) && (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#F87171" />
              <Text style={styles.errorText}>{localError || authError}</Text>
            </View>
          )}

          {Boolean(successMessage) && (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color="#34D399" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {mode === "signup" && (
              <View>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="e.g. Viswanathan Anand"
                  placeholderTextColor="#71717A"
                  style={styles.input}
                />
              </View>
            )}

            <View>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="master@chess.in"
                placeholderTextColor="#71717A"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {mode !== "forgot" && (
              <View>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  {mode === "signin" && (
                    <Pressable
                      onPress={() => {
                        setMode("forgot");
                        setLocalError(null);
                        setSuccessMessage(null);
                      }}
                    >
                      <Text style={styles.forgotLink}>Forgot?</Text>
                    </Pressable>
                  )}
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#71717A"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            )}

            <Pressable onPress={handleSubmit} disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <KeyRound size={16} color="#000" />
                  <Text style={styles.submitBtnText}>
                    {mode === "signin" && "Authenticate Session"}
                    {mode === "signup" && "Create Official Passport"}
                    {mode === "forgot" && "Send Reset Instructions"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Alternative Buttons */}
          <View style={styles.altGrid}>
            <Pressable onPress={handleGoogleSignIn} style={styles.altBtn}>
              <Globe size={16} color="#60A5FA" />
              <Text style={styles.altBtnText}>Google</Text>
            </Pressable>

            <Pressable onPress={handleGuestLogin} style={styles.altBtn}>
              <Sparkles size={16} color="#D4AF37" />
              <Text style={styles.altBtnText}>Guest Play</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#0A0A0C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 20,
    width: "100%",
    maxWidth: 400,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 8,
  },
  badgeText: {
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  noticeText: {
    color: "#FBBF24",
    fontSize: 11,
    flex: 1,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  activeModeTab: {
    backgroundColor: "#D4AF37",
  },
  modeTabText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeModeTabText: {
    color: "#000000",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(159, 18, 57, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.4)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#FDA4AF",
    fontSize: 11,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(6, 78, 59, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  successText: {
    color: "#6EE7B7",
    fontSize: 11,
  },
  form: {
    gap: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  forgotLink: {
    color: "#A1A1AA",
    fontSize: 10,
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 6,
  },
  submitBtnText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "bold",
  },
  altGrid: {
    flexDirection: "row",
    gap: 10,
  },
  altBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 14,
  },
  altBtnText: {
    color: "#E4E4E7",
    fontSize: 11,
    fontWeight: "bold",
  },
});
