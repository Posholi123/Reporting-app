import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import StudentAttendanceScreen from '../screens/student/StudentAttendanceScreen';
import AttendanceHistoryScreen from '../screens/student/AttendanceHistoryScreen';
import StudentRatingScreen from '../screens/student/StudentRatingScreen';
import ViewReportsScreen from '../screens/shared/ViewReportsScreen';
import { LogoutButton } from '../components/LogoutButton';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function StudentTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Classes') iconName = 'school';
          else if (route.name === 'Attendance') iconName = 'calendar';
          else if (route.name === 'Rating') iconName = 'star';
          else if (route.name === 'View Reports') iconName = 'document-text';
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
      <Tab.Screen name="Classes" component={StudentAttendanceScreen} />
      <Tab.Screen name="Attendance" component={AttendanceHistoryScreen} />
      <Tab.Screen name="Rating" component={StudentRatingScreen} />
      <Tab.Screen name="View Reports" component={ViewReportsScreen} />
    </Tab.Navigator>
  );
}