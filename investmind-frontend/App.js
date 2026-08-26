import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importações dos componentes
import HomeScreen from './src/screens/HomeScreen';
import AlertScreen from './src/screens/AlertScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#cc007a',
          tabBarInactiveTintColor: '#6B778C',
          tabBarStyle: { paddingBottom: 5, height: 60 }
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ tabBarLabel: 'Cotações' }}
        />
        <Tab.Screen 
          name="Alertas" 
          component={AlertScreen} 
          options={{ tabBarLabel: 'Alertas' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}