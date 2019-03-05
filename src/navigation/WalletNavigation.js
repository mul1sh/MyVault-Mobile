import React, { Component } from "react";
import { createStackNavigator } from "react-navigation";

import Header from "../components/Headers/Header";

import WalletFlow from "../screens/MainApp/WalletFlow";
const WalletNavigator = createStackNavigator(
    {
        WalletFlow: {
            screen: WalletFlow,
        },
    },
    {
        initialRouteName: 'WalletFlow',
        headerMode: 'none',
    }


)

export default WalletNavigator;
