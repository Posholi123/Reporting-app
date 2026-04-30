import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AddCourseScreen from '../screens/pl/AddCourseScreen';
import AssignLecturerScreen from '../screens/pl/AssignLecturerScreen';
import ViewReportsScreen from '../screens/shared/ViewReportsScreen';
import ViewRatingsScreen from '../screens/shared/ViewRatingsScreen';
import { LogoutButton } from '../components/LogoutButton';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function PLTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Add Course') iconName = 'add-circle';
          else if (route.name === 'Assignments') iconName = 'people';
          else if (route.name === 'Reports') iconName = 'document-text';
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
      <Tab.Screen name="Add Course" component={AddCourseScreen} />
      <Tab.Screen name="Assignments" component={AssignLecturerScreen} />
      <Tab.Screen name="Reports" component={ViewReportsScreen} />
      <Tab.Screen name="Ratings" component={ViewRatingsScreen} />
    </Tab.Navigator>
  );
}