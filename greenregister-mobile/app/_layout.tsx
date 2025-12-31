import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from '../src/context/AuthContext';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Home from '../src/pages/Home';
import Catalog from '../src/pages/Catalog';
import MyPlants from '../src/pages/MyPlants';
import CatalogDetail from '../src/pages/CatalogDetail';
import PlantDetail from '../src/pages/PlantDetail';
import RegisterActivity from '../src/pages/RegisterActivity';
import ActivityHistory from '../src/pages/ActivityHistory';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Catalog" component={Catalog} />
          <Stack.Screen name="MyPlants" component={MyPlants} />
          <Stack.Screen name="CatalogDetail" component={CatalogDetail} />
          <Stack.Screen name="PlantDetail" component={PlantDetail} />
          <Stack.Screen name="RegisterActivity" component={RegisterActivity} />
          <Stack.Screen name="ActivityHistory" component={ActivityHistory} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}