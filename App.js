import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { registerForPushNotificationsAsync } from './utils/notifications';

// --- MOCK DATABASE (MVP DATA) ---
// In a real app, this data comes from a server.
// For this showcase, we map Barcodes -> Expiration Info.
const PRODUCT_DB = {
  "123456": { name: "Organic Milk", daysLeft: 2 },
  "654321": { name: "Greek Yogurt", daysLeft: 0 }, // Expired
  "111000": { name: "Chicken Breast", daysLeft: -1 }, // Expired yesterday
  "default": { name: "Unknown Item", daysLeft: 10 } // Fallback for testing
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);

  // Register for push notifications on mount
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push notification token registered:', token);
      }
    }).catch(error => {
      console.error('Error registering for push notifications:', error);
    });
  }, []);

  // 1. HANDLE PERMISSIONS
  if (!permission) {
    // Camera is loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Permission not granted yet
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>We need camera access to scan products.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 2. HANDLE BARCODE SCAN
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    // Look up the code in our Mock DB, or use the default if not found
    // (In a real app, you would fetch from API here)
    const product = PRODUCT_DB[data] || PRODUCT_DB["default"];
    
    setScannedProduct({
      barcode: data,
      name: product.name,
      daysLeft: product.daysLeft,
      // Simple logic to determine status message
      status: product.daysLeft < 0 ? "EXPIRED" : 
              product.daysLeft === 0 ? "EXPIRES TODAY" : 
              `Expires in ${product.daysLeft} days`
    });
  };

  // 3. RESET SCANNER
  const closeResult = () => {
    setScanned(false);
    setScannedProduct(null);
  };

  return (
    <View style={styles.container}>
      
      {/* CAMERA LAYER */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "upc_e", "code128"], 
        }}
      />

      {/* OVERLAY: TARGET BOX */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.overlayText}>Align code within frame</Text>
      </View>

      {/* RESULT POPUP (MODAL) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scanned && scannedProduct !== null}
        onRequestClose={closeResult}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.productName}>{scannedProduct?.name}</Text>
            <Text style={styles.barcodeText}>Code: {scannedProduct?.barcode}</Text>
            
            {/* Dynamic Status Box */}
            <View style={[
              styles.statusBox, 
              (scannedProduct?.daysLeft <= 2) ? styles.bgDanger : styles.bgSafe
            ]}>
              <Text style={styles.statusText}>
                {scannedProduct?.status}
              </Text>
            </View>

            <TouchableOpacity style={styles.scanBtn} onPress={closeResult}>
              <Text style={styles.scanBtnText}>Scan Next Item</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Camera Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  overlayText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 5,
    overflow: 'hidden',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    alignItems: 'center',
    minHeight: 300,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  barcodeText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  statusBox: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  bgSafe: {
    backgroundColor: '#d1fae5', // Light Green
  },
  bgDanger: {
    backgroundColor: '#fee2e2', // Light Red
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scanBtn: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});