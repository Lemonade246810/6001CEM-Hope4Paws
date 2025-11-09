import { Text, View } from 'react-native';
import { useAuth } from '../../context/authContext';

export default function Header() {
    const {user} = useAuth();
  return (
    <View style={{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center'
    }}>
      <View>
        <Text style={{
          fontFamily:'roboto-medium',
          fontSize: 20
        }}>
          Welcome 👋,
        </Text>
        <Text style={{
          fontFamily:'roboto-bold',
          fontSize: 28
        }}>
          {user?.username}
        </Text>
      </View>
    </View>
  )
}