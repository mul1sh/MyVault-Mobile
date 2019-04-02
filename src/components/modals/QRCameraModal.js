'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  ActivityIndicator,
  Linking,
  Vibration
} from 'react-native';
import RNCamera from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner'
// import { BarcodeMask } from 'react-native-barcode-mask';
import modalStyle from "../../components/modals/ModalStyles";
import Modal from "react-native-modal";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default class QRCameraModal extends Component {

    constructor(props) {
        super(props);
        // const initial = null;
    }
    componentDidMount(){
      console.log('jm QR Camera Loaded! Yay!')
    }

    // componentDidUpdate(oldProps) {
    //     const newProps = this.props;
    //     if (oldProps !== newProps) {
    //         this.setState({
    //             visible: this.props.isVisible
    //         })
    //     }
    // }

    // takePicture = async () => {
    //     if (this.camera) {
    //         const options = {
    //             base64: true
    //         }
    //         try {
    //           const data = await this.camera.takePictureAsync(options);
    //           console.log(data, 'taken picture info, looking for name')
    //         }
    //         catch (err) {
    //           console.log('err: ', err)
    //         }
    //     };
    // }


    onSuccess(e) {
      console.log('jm captured data', e);
      Vibration.vibrate();
      this.setState({ data: e })
      // put e.data in redux
      // e Object keys: bounds, type, rawData, data, target
    }
    render() {
        // console.log(Object.keys(this.state), "thisStatein Render")
        console.log('jm QR Modal loaded');
        return (
          <Modal
            onBackButtonPress={this.props.closeModal}
            isVisible={this.props.isVisible}
            >
          <View style={styles.container}>

          <QRCodeScanner
           cameraProps={{captureAudio: false}}
           onRead={this.onSuccess.bind(this)}
           topContent={
             <Text style={styles.centerText}>
               Julie:
             </Text>
           }
           bottomContent={
             <TouchableOpacity style={styles.buttonTouchable}>
               <Text style={styles.buttonText}>OK. Got it!</Text>
             </TouchableOpacity>
           }
         />
        {/*
          <RNCamera
              ref={(cam) => {
                  this.camera = cam;
              }}
              // ratio={"4:4"}
              barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
              style={styles.preview}
              // type={RNCamera.Constants.Type.back}
              // flashMode={RNCamera.Constants.FlashMode.off}
              // permissionDialogTitle={'Permission to use camera'}
              // permissionDialogMessage={'We need your permission to use your camera phone'}
              onGoogleVisionBarcodesDetected={({ barcodes }) => {
                  console.log('jm barcode captured: ',barcodes);
              }}
              onBarCodeRead={(res) => {console.log('jm another barcode read', res);}}
          >
              <TouchableHighlight
                  style={styles.capture}
                  onPress={this.takePicture.bind(this)}
                  underlayColor="rgba(255, 255, 255, 0.5)"
              >
                  <View />
              </TouchableHighlight>
              <Icon name={'cancel'} size={33} onPress={() => this.setState({visible: false})} />
          </RNCamera>
          */}
          </View>
          </Modal>
        );
    }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      padding: 50
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
