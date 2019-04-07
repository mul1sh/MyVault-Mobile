package com.MyVault;

import com.entria.views.RNViewOverflowPackage;
import android.app.Application;
import com.facebook.react.ReactApplication;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.peel.react.TcpSocketsModule;
import com.swmansion.rnscreens.RNScreensPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.imagepicker.ImagePickerPackage;
import com.rnfs.RNFSPackage;
import co.airbitz.fastcrypto.RNFastCryptoPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.reactnative.camera.RNCameraPackage;
import co.airbitz.AbcCoreJsUi.AbcCoreJsUiPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new RNViewShotPackage(),
            new MainReactPackage(),
            new ImagePickerPackage(),
            new RNScreensPackage(),
            new LinearGradientPackage(),
            new ReactNativeDocumentPicker(),
            new RNCameraPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage(),
            new AbcCoreJsUiPackage(),
            new TcpSocketsModule(),
            new RandomBytesPackage(),
            new RNFSPackage(),
            new RNFastCryptoPackage(),
            new RNViewOverflowPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
