import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LecturerReportForm from '../screens/lecturer/LecturerReportForm';
import LecturerClassesScreen from '../screens/lecturer/LecturerClassesScreen';
import LecturerAttendanceScreen from '../screens/lecturer/LecturerAttendanceScreen';
import ViewReportsScreen from '../screens/shared/ViewReportsScreen';
import ViewRatingsScreen from '../screens/shared/ViewRatingsScreen';
import { LogoutButton } from '../components/LogoutButton';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function LecturerTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Classes') iconName = 'calendar';
          else if (route.name === 'Add Report') iconName = 'create';
          else if (route.name === 'Attendance') iconName = 'people';
          else if (route.name === 'View Reports') iconName = 'document-text';
          else if (route.name === 'Ratings') iconName = 'star';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.header, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.header },
        headerTitleStyle: { color: colors.textPrimary },
        headerRight: () => <LogoutButton navigation={navigation} />,
      })}
    >
      <Tab.Screen name="Classes" component={LecturerClassesScreen} />
      <Tab.Screen name="Add Report" component={LecturerReportForm} />
      <Tab.Screen name="Attendance" component={LecturerAttendanceScreen} />
      <Tab.Screen name="View Reports" component={ViewReportsScreen} />
      <Tab.Screen name="Ratings" component={ViewRatingsScreen} />
    </Tab.Navigator>
  );
}