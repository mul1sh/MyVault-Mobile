import React, { Component } from 'react';
import { createStackNavigator, createDrawerNavigator, createSwitchNavigator } from 'react-navigation';


import SideNavMenu from "../components/SideNavMenu"
import Login from "../screens/MainApp/Login";
import Header from "../components/Headers/Header";
import WalletNavigator from "./WalletNavigation";

const MainNavigator = createStackNavigator({
    WalletNavigator: {
        screen: WalletNavigator,
        navigationOptions: ({ navigation, screenProps }) => ({
            header: <Header headerTitle={'Wallet'} navigation={navigation} />
        })
    },
},
    {
        initialRouteName: 'WalletNavigator',
        headerMode: 'screen'
    }

)

const SideMenuNavigator = createDrawerNavigator(
        {
            MainNavigator: MainNavigator,
        },
        {
            contentComponent: SideNavMenu,
            drawerWidth: 250,
            drawerPosition: 'left',
            drawerOpenRoute: 'DrawerOpen',
            drawerCloseRoute: 'DrawerClose',
            drawerToggleRoute: 'DrawerToggle',
        })

const LoginNav = createSwitchNavigator(
    {
        Login: {
            screen: Login
        },
        SideMenuNav: {
            screen: SideMenuNavigator
        }
    },
    {
        initialRouteName: 'Login'
    }
)

export default LoginNav;
