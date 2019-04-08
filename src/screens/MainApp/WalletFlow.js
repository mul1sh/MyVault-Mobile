import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableHighlight,
  ScrollView,
  Alert,
  Clipboard,
  ActivityIndicator,
  Linking
} from "react-native";
import React from "react";
import styles from "../../assets/styles";
import agldCoin from "../../assets/icons/agldCoin.png";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import QRCode from "react-qr-code";
import RadioForm from "react-native-simple-radio-button";
import Modal from "react-native-modal";
import CustomModal from "../../components/modals/CustomModal";
import QRCameraModal from "../../components/modals/QRCameraModal";
import { GetDestinationAddress, ToggleDisplayQRScanner, ReturnTempBalance } from "../../features/WalletFlow/WalletActionCreators";

class WalletFlow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      destinationAddress: this.props.destinationAddress,
      sendAmount: "",
      displayWallet: "",
      selectedCrypto: "AHLD",
      receiveModalVisible: false,
      transactions: [],
      displayTransactions: true,
      displayModalChooseToken: false,
      displayModalSendDetails: false,
      displayModalConfirmation: false,
      displayModalComplete: false,
      transactionID: ""
    };
  }

  static navigationOptions = () => ({
    headerTitle: (
      <View style={localStyles.headerBox}>
        <Text style={localStyles.headerText}>Wallet</Text>
      </View>
    )
  });

  componentWillUnmount = () => {
    this._closeAllModals()
  }

  componentWillMount = async () => {
    try{
      let light = await this.props.wallet.getEnabledTokens();
      let enabledTokens = light.reverse();
      this.setState(
        {
          displayWallet: enabledTokens[0] // initiate with AHLD wallet
        }
      );
    }
    catch(e){
      let enabledTokens = ['AHLD', 'ETH']
      this.setState(
        {
          displayWallet: enabledTokens[0] // initiate with AHLD wallet
        }
      );
    }
  };

initiateWallet = () => {
  console.log('jm this.props.ethereumAddress should be here', this.props.ethereumAddress);
  this._getActivity(this.props.ethereumAddress, this.state.displayWallet);
  if (!this.props.watchBalance || !this.props.watchBalance.ETH) {
    if (this.props.wallet) {
      let tempBalance = this.props.ReturnTempBalance(this.state.displayWallet)
      this.setState({tempBalance: tempBalance.tempBalance})
    }
  }
}

  _updateWallet = () => {
    console.log('jm ran _updateWallet \n [[NEW QR]]:', this.props.destinationAddress);
    if (!this.props.watchBalance || !this.props.watchBalance.ETH) {
      if (this.props.wallet) {
        let tempBalance = this.props.ReturnTempBalance(this.state.displayWallet)
        return tempBalance.tempBalance
      }
    }
  };

  async _onPressSend() {
    let selectedCrypto = this.state.selectedCrypto;
    const wallet = this.props.wallet;
    let destinationAddress = this.props.destinationAddress;
    let sendAmountInEth = new BigNumber(this.state.sendAmount);
    if (!destinationAddress) Alert.alert("Missing Destination Address");
    if (!sendAmountInEth) Alert.alert("Invalid Send Amount");
    let sendAmountInWei = sendAmountInEth.times(1e18).toString();
    console.log('jm ', sendAmountInWei, selectedCrypto);

    const spendInfo = {
      networkFeeOption: "standard",
      currencyCode: selectedCrypto,
      metadata: {
        name: "Transfer From AGLD Wallet",
        category: "Transfer:Wallet"
      },
      spendTargets: [
        {
          publicAddress: destinationAddress,
          nativeAmount: sendAmountInWei
        }
      ]
    };
    try {
      console.log('jm ran this line2');
      let transaction = await this.props.wallet.makeSpend(spendInfo);
      console.log('jm tx', transaction);
      await wallet.signTx(transaction);
      await wallet.broadcastTx(transaction);
      await wallet.saveTx(transaction);
      this._closeAllModals();
      this.setState({
        transactionID: transaction.txid,
        displayModalComplete: true,
      });

      // Alert.alert(
      //   "Transaction ID",
      //   abcTransaction.txid,
      //   [
      //     {
      //       text: "Copy",
      //       onPress: () => this.writeToClipboard(abcTransaction.txid),
      //       style: "cancel"
      //     },
      //     { text: "OK", onPress: () => console.log("OK Pressed") }
      //   ],
      //   { cancelable: false }
      // );
    } catch (e) {
      let displayWallet = this.state.displayWallet;
      if (displayWallet === "AHLD") {
        let tempBalance = new BigNumber(
          this.props.wallet.balances[displayWallet]
        )
        .times(1e-9)
        .toFixed(9);
      } else {
        let tempBalance = new BigNumber(
          this.props.wallet.balances[displayWallet]
        )
        .times(1e-18)
        .toFixed(18);
      }

      Alert.alert(
        "Insufficient Funds",
        "Balance: " + tempBalance + " " + displayWallet,
        [{ text: "Ok", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
    // TODO: after successful transaction, reset state.
  }

  writeToClipboard = async data => {
    await Clipboard.setString(data);
    Alert.alert("Copied to clipboard", data);
  };

  _addWallet = walObj => {
    this.props.addWallet(walObj);
    this.setModalVisible();
  };

  _toggleReceiveModal = () => {
    this.setState({
      receiveModalVisible: !this.state.receiveModalVisible
    });
  };

  _closeAllModals = () => {
    this.props.ToggleDisplayQRScanner(false)
    this.setState({
      displayModalChooseToken: false,
      displayModalSendDetails: false,
      displayModalConfirmation: false,
      displayModalComplete: false,
      receiveModalVisible: false
    });
  };

  _displayChangeCurrency = () => {
    if (this.state.displayWallet === "AHLD") {
      return (
        // <View style={localStyles.changeCurrencyContainer}>
        //   <Image style={localStyles.smallIcon} source={agldCoin} />
        //   <Text style={localStyles.changeCurrencyText}> AHLD</Text>
        // </View>
        <View style={localStyles.changeCurrencyContainer}>
          <Icon name="ethereum" size={16} />
          <Text style={localStyles.changeCurrencyText}> ETH</Text>
        </View>
      );
    } else {
      return (
        // <View style={localStyles.changeCurrencyContainer}>
        //   <Icon name="ethereum" size={16} />
        //   <Text style={localStyles.changeCurrencyText}> ETH</Text>
        // </View>
        <View style={localStyles.changeCurrencyContainer}>
          <Image style={localStyles.smallIcon} source={agldCoin} />
          <Text style={localStyles.changeCurrencyText}> AHLD</Text>
        </View>
      );
    }
  };

  _selectCrypto = crypto => {
    this.setState({
      selectedCrypto: crypto
    });
  };

  _displayActivity = (transaction, index) => {
    let transactionAmount;
    if(this.state.displayWallet === "AHLD"){
      //convert the AHLD values to appropriate decimal places
      transactionAmount = new BigNumber(transaction.value).times(1e-9).toFixed(9);
    }else if ( this.state.displayWallet === "ETH"){
      //ETH values are received at correct decimal places
      transactionAmount = new BigNumber(transaction.value).toFixed(18);
    }
    if (transaction.from === this.props.ethereumAddress) {
      activityType = "Sent";
    } else if (transaction.to === this.props.ethereumAddress) {
      activityType = "Received";
    }
    var t = new Date(transaction.timestamp * 1000).toString();
    var formattedTime = t.substr(4, 17);
    return (
      <View
        key={index}
        style={[
          localStyles.displayActivityContainer,
          this.state.displayTransactions
            ? localStyles.displayFlex
            : localStyles.displayNone,
          index % 2 === 0
            ? localStyles.displayActivityContainerBG1
            : localStyles.displayActivityContainerBG2
        ]}
      >
        <Icon
          style={[{ flex: 1, alignSelf: "center" }]}
          name={
            activityType === "Sent" ? "arrow-top-right" : "arrow-bottom-left"
          }
          size={32}
          color={activityType === "Sent" ? "#f5565b" : "#95c260"}
        />
        <View style={{ flex: 4 }}>
          <Text style={{ color: "#9398b2" }}>
            {activityType} {this.state.displayWallet}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>
            {transactionAmount} {' '}
             {this.state.displayWallet}
          </Text>
        </View>
        <Text
          style={{
            flex: 3,
            color: "#9398b2",
            fontSize: 12,
            textAlign: "right"
          }}
        >
          {formattedTime}
        </Text>
      </View>
    );
  };

  _getActivity = (address, token) => {
    let contractAddress = "0x62abd749d52043cd6a5542247d604491186540c2";
    let api = "";
    if (token === "ETH") {
      api =
        "http://api.ethplorer.io/getAddressTransactions/" +
        address +
        "?apiKey=freekey";
    } else if (token === "AHLD") {
      api =
        "http://api.ethplorer.io/getAddressHistory/" +
        address +
        "?apiKey=freekey&token=" +
        contractAddress;
    }

    fetch(api)
      .then(response => response.json())
      .then(responseJson => {
        if (token === "ETH") {
          this.setState({
            transactions: responseJson,
            displayTransactions: true
          });
        } else if (token === "AHLD") {
          this.setState({
            transactions: responseJson.operations,
            displayTransactions: true
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  _changeCurrency = async () => {
    await this.setState(
      {
        displayTransactions: false,
        displayWallet: this.state.displayWallet === "AHLD" ? "ETH" : "AHLD"
      },
      () => this._updateWallet()
    );
    this._getActivity(this.props.ethereumAddress, this.state.displayWallet);
  };

  render() {
    let currencyValue
    if (!this.props.ethereumAddress) {
      return (
        <View style={localStyles.modalBackground}>
          <ActivityIndicator animating={true} size="large" color="#000000" />
        </View>
      )
  }
    if (this.state.tempBalance) {
      currencyValue = this._updateWallet();
    } else {
      currencyValue = this.initiateWallet();
    }

    return (
      <View style={localStyles.walletContainer}>
        <View style={localStyles.balanceWrapperContainer}>
          <View style={localStyles.balanceContainer}>
            <View style={localStyles.balanceInnerContainer}>
              <View style={localStyles.balanceInnerLeftContainer}>
                <Text style={localStyles.balanceLabelText}>Your Balance</Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginRight: 5,
                    alignItems: "center"
                  }}
                >
                  <Text style={localStyles.balanceText}>{currencyValue} </Text>
                  {this.state.displayWallet === "AHLD" ? (
                    <Image style={localStyles.icon} source={agldCoin} />
                  ) : (
                    <Icon name="ethereum" size={26} />
                  )}
                </View>
              </View>
              <View style={localStyles.balanceInnerRightContainer}>
                <Text
                  style={[
                    localStyles.balanceLabelText,
                    { alignSelf: "center" }
                  ]}
                >
                  Choose
                </Text>
                <TouchableHighlight
                  onPress={() => {
                    this._changeCurrency();
                  }}
                >
                  {this._displayChangeCurrency()}
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </View>

        <View style={localStyles.activityContainer}>
          <Text>Activity</Text>
          <ScrollView>
            {typeof this.state.transactions !== "undefined"
              ? this.state.transactions.map((transaction, index) =>
                  this._displayActivity(transaction, index)
                )
              : null}
          </ScrollView>
        </View>
        <View style={localStyles.actionsContainer}>
          <TouchableHighlight
            style={[localStyles.actionButton, { backgroundColor: "#95c260" }]}
            onPress={() => this.setState({ displayModalChooseToken: true })}
          >
            <Text style={localStyles.actionButtonText}>Send</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={[localStyles.actionButton, { backgroundColor: "#f5565b" }]}
            onPress={this._toggleReceiveModal}
          >
            <Text style={localStyles.actionButtonText}>Receive</Text>
          </TouchableHighlight>
        </View>

        <Modal
          isVisible={this.state.displayModalChooseToken}
          onBackButtonPress={() =>
            this.setState({ displayModalChooseToken: false })
          }
          onBackdropPress={this._closeAllModals}
          style={{ margin: 0 }}
        >
          <View style={modalStyles.modalLower}>
            <View style={modalStyles.sendCryptoContainer}>
              <Text style={modalStyles.menuTitle}>Send Cryptocurrency</Text>
              <Text style={modalStyles.menuSubtitle}>
                Choose Cryptocurrency
              </Text>

              <View style={modalStyles.send1LowerContainer}>
                <View style={modalStyles.sourceIconContainer}>
                  <TouchableHighlight
                    onPress={() => this._selectCrypto("AHLD")}
                  >
                    <View
                      style={[
                        modalStyles.cryptoIconContainer,
                        this.state.selectedCrypto === "AHLD"
                          ? modalStyles.selectedCryptoIconBackground
                          : modalStyles.unselectedCryptoIconBackground
                      ]}
                    >
                      <Image style={localStyles.icon} source={agldCoin} />
                    </View>
                  </TouchableHighlight>
                  <Text
                    style={[
                      modalStyles.cryptoText,
                      this.state.selectedCrypto === "AHLD"
                        ? modalStyles.selectedCryptoTextColor
                        : modalStyles.unselectedCryptoTextColor
                    ]}
                  >
                    AHLD
                  </Text>
                </View>

                <View style={modalStyles.sourceIconContainer}>
                  <TouchableHighlight onPress={() => this._selectCrypto("ETH")}>
                    <View
                      style={[
                        modalStyles.cryptoIconContainer,
                        this.state.selectedCrypto === "ETH"
                          ? modalStyles.selectedCryptoIconBackground
                          : modalStyles.unselectedCryptoIconBackground
                      ]}
                    >
                      <Icon name="ethereum" size={26} />
                    </View>
                  </TouchableHighlight>
                  <Text
                    style={[
                      modalStyles.cryptoText,
                      this.state.selectedCrypto === "ETH"
                        ? modalStyles.selectedCryptoTextColor
                        : modalStyles.unselectedCryptoTextColor
                    ]}
                  >
                    ETH
                  </Text>
                </View>
              </View>

              <TouchableHighlight
                onPress={() => {
                  this.setState({
                    displayModalChooseToken: false,
                    displayModalSendDetails: true
                  });
                }}
                style={[localStyles.bigButton,{backgroundColor: "#000",}]}
              >
                <Text style={localStyles.bigButtonText}>Next</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>

        <Modal
          isVisible={this.state.displayModalSendDetails}
          onBackButtonPress={() => {
            this.setState({ displayModalSendDetails: false, displayModalChooseToken: true })
          }}
          onBackdropPress={this._closeAllModals}
          style={{ margin: 0 }}
        >
          <View style={modalStyles.modalLower}>
            <View style={modalStyles.sendCryptoContainer}>
              <Text style={modalStyles.menuTitle}>Send Cryptocurrency</Text>
              <Text style={modalStyles.menuSubtitle}>
                Send Details
              </Text>

              <View style={modalStyles.send2LowerContainer}>
                <View style={localStyles.QRcontainer}>
                  <TextInput
                    style={localStyles.textInput}
                    underlineColorAndroid="transparent"
                    placeholder="Destination"
                    onChangeText={destinationAddress =>
                      this.props.GetDestinationAddress(destinationAddress)
                    }
                    value={this.props.destinationAddress}
                  />

                    <Icon
                      name="qrcode-scan" size={20}
                      onPress={() => {
                        this.props.ToggleDisplayQRScanner(true)
                      }}
                    />
                  </View>


                <TextInput
                  style={localStyles.textInput}
                  underlineColorAndroid="transparent"
                  placeholder="Amount"
                  onChangeText={sendAmount =>
                    this.setState({ sendAmount }, () =>
                      console.log("sendAmount", this.state.sendAmount)
                    )
                  }
                  value={this.state.sendAmount}
                />
              </View>

              <TouchableHighlight
                onPress={() => {
                  this.setState({
                    displayModalConfirmation: true,
                    displayModalSendDetails: false
                  });
                }}
                style={[localStyles.bigButton,{backgroundColor: "#95c260"}]}
              >
                <Text style={localStyles.bigButtonText}>Send</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>


        <Modal
          isVisible={this.state.displayModalConfirmation}
          onBackButtonPress={() => {
            this.setState({ displayModalConfirmation: false, displayModalSendDetails: true })
          }}
          onBackdropPress={this._closeAllModals}
          style={{ margin: 0 }}
        >
          <View style={modalStyles.modalLower}>
            <View style={modalStyles.sendCryptoContainer}>
              <Text style={modalStyles.menuTitle}>Send Cryptocurrency</Text>
              <Text style={modalStyles.menuSubtitle}>Confirmation</Text>

              <View style={modalStyles.send2LowerContainer}>
                <View style={{ width: "90%" }}>
                  <Text style={{ textAlign: "left" }}>Address</Text>
                  <Text style={{ color: "gold" }}>
                    {this.props.destinationAddress}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    width: "90%"
                  }}
                >
                  <View>
                    <Text style={modalStyles.menuSubtitle}>Amount</Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "black"
                      }}
                    >
                      {" "}
                      {this.state.sendAmount}{" "}
                    </Text>
                  </View>
                  <View>
                    <Text style={modalStyles.menuSubtitle}>Cryptocurrency</Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "black"
                      }}
                    >
                      {this.state.selectedCrypto}
                    </Text>
                  </View>
                  {/* ***THIS IS THE DOLLARS VALUE WORTH OF CRYPTO**

                  <View>
                    <Text style={modalStyles.menuSubtitle}>US Dollars</Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "black"
                      }}
                    >
                      500
                    </Text>
                  </View> */}

                </View>
              </View>

              <TouchableHighlight
                onPress={() => {
                  this._closeAllModals();
                  this._onPressSend()
                }}
                style={localStyles.confirmButton}
              >
                <Text style={localStyles.confirmButtonText}>Send</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        <Modal
          isVisible={this.state.receiveModalVisible}
          onBackButtonPress={this._toggleReceiveModal}
          onBackdropPress={this._closeAllModals}
          style={{ margin: 0 }}
        >
          <View style={modalStyles.modalLower}>
            <View style={modalStyles.receiveContainer}>
              <Text style={modalStyles.menuTitle}>Receive Cryptocurrency</Text>
              {this.props.ethereumAddress ? (
                <QRCode size={180} value={this.props.ethereumAddress} />
              ) : null}
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={modalStyles.menuSubtitle}>
                  Hold to copy wallet address
                </Text>
                <View style={modalStyles.addressContainer} />
                <TouchableHighlight
                  onPress={() => {
                    this.writeToClipboard(this.props.ethereumAddress);
                  }}
                >
                  <View style={modalStyles.addressContainer}>
                    <Text style={{ fontSize: 12 }}>Address</Text>
                    <Text style={modalStyles.addressText}>
                      {this.props.ethereumAddress}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
        <CustomModal
          isVisible={this.state.displayModalComplete}
          modalCase="complete"
          content={
            this.state.selectedCrypto + " has been sent successfully. \nTransaction ID: "}
          transactionID={
            this.state.transactionID
          }
          writeToClipboard={() => { this.writeToClipboard(this.state.transactionID) }}
          dismissAcceptText="Continue"
          closeModal={() => {
            this.setState({ displayModalComplete: false });
          }}
        />
        <QRCameraModal
          isVisible={this.props.displayModalQR}
          closeModal={() => {
            this.props.ToggleDisplayQRScanner(false)
        }
        }
          onBackButtonPress={() => {
            this.props.ToggleDisplayQRScanner(false)
            this.setState({
            displayModalSendDetails: true
          })
        }
        }
        />
        <CustomModal
          isVisible={false}
          modalCase="error"
          content="Something went wrong."
          dismissRejectText="Try again"
          closeModal={() => {}}
        />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  ethereumAddress: state.WalletReducers.ethereumAddress,
  availableWallets: state.WalletReducers.walletTypes,
  wallet: state.WalletReducers.wallet,
  account: state.WalletReducers.account,
  watchBalance: state.WalletReducers.watchBalance,
  destinationAddress: state.WalletReducers.destinationAddress,
  displayModalQR: state.WalletReducers.ToggleDisplayQRScanner
});

const mapDispatchToProps = (dispatch) => ({
    GetDestinationAddress: (address) => dispatch(GetDestinationAddress(address)),
    ToggleDisplayQRScanner: (value) => dispatch(ToggleDisplayQRScanner(value)),
    ReturnTempBalance: (displayWallet) => dispatch(ReturnTempBalance(displayWallet))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletFlow);

const localStyles = StyleSheet.create({
  QRcontainer: {
    width: "90%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: "#f2f3fb"
  },
  modalBackground: {
      flex:1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff'
  },
  walletContainer: {
    flex: 1,
    backgroundColor:"#000",
    justifyContent: "center"
  },
  balanceWrapperContainer: {
    flex: 3
  },
  balanceContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.17)',
    borderRadius: 5
  },
  activityContainer: {
    flex: 8,
    backgroundColor: "#ffffff",
    // borderTopRightRadius: 10,
    // borderTopLeftRadius: 10,
    padding: 20
  },
  actionsContainer: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center"
  },
  balanceText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  },
  balanceLabelText: {
    color: "#8e94af",
    fontSize: 14
  },
  balanceInnerContainer: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 15,
    marginHorizontal: 20
  },
  balanceInnerLeftContainer: {
    flex: 2,
    justifyContent: "space-evenly"
  },
  balanceInnerRightContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  changeCurrencyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center"
  },

  changeCurrencyText: {
    fontSize: 10,
    fontWeight: "bold"
  },

  icon: {
    height: 26,
    width: 26,
    borderRadius: 26 / 2,
    resizeMode: "contain",
    alignSelf: "center"
  },

  smallIcon: {
    height: 16,
    width: 16,
    borderRadius: 16 / 2,
    resizeMode: "contain",
    alignSelf: "center"
  },

  actionButton: {
    flex: 1,
    margin: 10,
    // borderRadius: 20,
    alignItems: "center"
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 10
  },

  headerBox: {
    flex: 1,
    backgroundColor: "#000",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  headerText: {
    color: "white",
    textAlign: "center",
    fontSize: 26
  },
  text: {
    color: "black",
    textAlign: "left",
    fontSize: 22,
    fontWeight: "normal",
    margin: 5,
    fontFamily: "dinPro"
  },
  flipIcon: {
    transform: [{ rotate: "270deg" }]
  },
  displayFlex: {
    display: "flex"
  },
  displayNone: {
    display: "none"
  },
  displayActivityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 5,
    marginTop: 5,
    padding: 10
  },
  displayActivityContainerBG1: {
    backgroundColor: "#f2f3fb"
  },
  displayActivityContainerBG2: {
    backgroundColor: "#ffffff"
  },
  bigButton: {
    margin: 5,
    // backgroundColor: "#f4c736",
    justifyContent: "center",
    alignItems: "center",
    height: "15%",
    width: "90%"
  },
  confirmButton: {
    margin: 5,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    height: "15%",
    width: "90%",
    // borderRadius: 5
  },
  bigButtonText: {
    color: "#ffffff",
    fontSize: 16
  },
  greenSendButton: {
    margin: 5,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    height: "15%",
    width: "90%",
    // borderRadius: 5
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16
  },
  textInput: {
    borderRadius: 5,
    backgroundColor: "#f2f3fb",
    width: "90%"
  }
});

const modalStyles = StyleSheet.create({
  modalLower: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "flex-end",
    flex: 1
  },

  send1LowerContainer: {
    height: "50%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "#ffffff"
  },
  send2LowerContainer: {
    width: "100%",
    height: "50%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    backgroundColor: "#ffffff"
  },
  sendCryptoContainer: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    height: "40%",
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10
  },
  sourceIconContainer: {
    height: "50%",
    width: "30%",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 50
  },
  cryptoIconContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50
  },
  selectedCryptoIconBackground: {
    backgroundColor: "#f5565b",
    borderRadius: 50
  },
  unselectedCryptoIconBackground: {
    backgroundColor: "#f2f3fb",
    borderRadius: 50
  },
  selectedCryptoTextColor: {
    color: "#f5565b"
  },
  unselectedCryptoTextColor: {
    color: "#8e94af"
  },
  cryptoText: {
    fontSize: 14,
    fontWeight: "bold"
  },

  menuTitle: {
    color: "#000000",
    fontSize: 18,
    margin: 10
  },
  menuSubtitle: {
    color: "#9398b2",
    fontSize: 12,
    margin: 5
  },
  receiveContainer: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "50%",
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
  },
  addressContainer: {
    backgroundColor: "#f2f3fb",
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5
  },
  addressText: {
    fontWeight: "bold",
    fontSize: 13
  }
});
