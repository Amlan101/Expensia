import { useClerk } from '@clerk/clerk-expo'
import {styles} from '../assets/styles/home.styles'
import { Alert, Text, TouchableOpacity } from 'react-native'
import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const handleSignOut = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?",[
      {text: "Cancel", style: "cancel"},
      {text: "Logout", style: "destructive", onPress: signOut},
    ]);
  }
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
    </TouchableOpacity>
  )
}