import {
    StyleSheet,
    Text,
    View,
    ImageBackground
} from "react-native";
import React, { Component } from "react";
import Icon from 'react-native-vector-icons/Entypo'
import styles from "./HeaderStyles";
import { createStackNavigator } from "react-navigation";
import ColorConstants from "../../assets/ColorConstants";
const bgImage = require("../../assets/main-bg.png")



 class Header extends Component {
    constructor(props) {
        super(props);
        console.log(props, this.state, "header stuff")
    }
    _goToWallet = () => {
      /* ********************************************
      This used to be a _goBack()
        let navigation = this.props.navigation;
        // let goBackTo = navigation.params.goBackTo
        console.log(navigation, "trying to go back")
        navigation.goBack();
        ******************************************** */
        this.props.navigation.navigate('WalletNavigator')
    }
    _toggleSideMenu = () => {
       console.log('ToggleSide');

        this.props.navigation.toggleDrawer();
    }

    render() {
        // let toggleSideMenu = this.props.screenProps.toggleSideMenu;
        // let screenProps = this.props.navigation.getScreenProps('toggleSideMenu');
        return (
            <View style={styles.headerCont}>
                <ImageBackground source={bgImage} style={styles.bgImage}>
                    <View style={styles.header__container}>
                        <View style={styles.sideHeaders}>
                            <Icon
                                onPress={this._toggleSideMenu}
                                style={[styles.iconButton, { marginLeft: 30 }]}
                                name='menu'
                                color={ColorConstants.MainGray}
                                size={25}
                            />
                        </View>
                        <Text style={styles.headerText}>{this.props.headerTitle}</Text>
                        <View style={styles.sideHeaders}>
                            {/*<Icon onPress={this._toggleSideMenu}
                                style={[styles.iconButton, { marginRight: 20 }]}
                                name='gear'
                                color={ColorConstants.MainGold}
                            />*/}
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    }
}
export default Header;
