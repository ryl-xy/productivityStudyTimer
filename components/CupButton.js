import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CupButton({ onPress}) {
    return(
        <TouchableOpacity style={styles.cup} onPress={onPress}>
            <Text style={styles.cupEmoji}>☕</Text>\
            <Text style={styles.cupText}>Select Timer Mode</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cup: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#d2691e',
        borderRadius: 50,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },

    cupEmoji: {
        fontSize: 40,
    },

    cupText: {
        fontSize: 10,
        color: '#fff',
        marginTop: 2,
    },
}); 
