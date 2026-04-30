import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ViewReportsScreen from '../screens/shared/ViewReportsScreen';
import ViewRatingsScreen from '../screens/shared/ViewRatingsScreen';
import PRLCoursesScreen from '../screens/prl/PRLCoursesScreen';
import { LogoutButton } from '../components/LogoutButton';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function PRLTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Courses') iconName = 'book';
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
      <Tab.Screen name="Courses" component={PRLCoursesScreen} />
      <Tab.Screen name="View Reports" component={ViewReportsScreen} />
      <Tab.Screen name="Ratings" component={ViewRatingsScreen} />
    </Tab.Navigator>
  );
}