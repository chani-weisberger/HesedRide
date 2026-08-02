import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { colors } from '@/styles/colors';

interface AddressInputProps {
  placeholder: string;
  onAddressSelect: (address: string, details?: any) => void;
}

/**
 * AddressInput renders address autocomplete for web and native platforms.
 */
const AddressInput: React.FC<AddressInputProps> = ({
  placeholder,
  onAddressSelect,
}) => {
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      (window as any).google
    ) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: 'il' },
          fields: ['formatted_address', 'geometry', 'name'],
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        onAddressSelect(place.name || place.formatted_address || '', place);
      });
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <input
          ref={inputRef}
          placeholder={placeholder}
          style={{
            height: 52,
            borderRadius: 14,
            padding: '0 16px',
            backgroundColor: '#FFFFFF',
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '52px',
            borderWidth: 1.5,
            borderColor: colors.inputBorder,
            borderStyle: 'solid',
            width: '100%',
            boxSizing: 'border-box',
            fontFamily:
              'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            textAlign: 'right',
            color: colors.primaryNavy,
            outline: 'none',
            direction: 'rtl',
          }}
          onFocus={(e: any) => {
            e.target.style.borderColor = colors.primaryBlue;
            e.target.style.backgroundColor = '#F0FDFA';
          }}
          onBlur={(e: any) => {
            e.target.style.borderColor = colors.inputBorder;
            e.target.style.backgroundColor = '#FFFFFF';
          }}
        />
      </View>
    );
  }

  const { GooglePlacesAutocomplete } = require('react-native-google-places-autocomplete');

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails={true}
        onPress={(data: any, details: any = null) => {
          onAddressSelect(data.description, details);
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: 'iw',
          components: 'country:il',
        }}
        styles={{
          textInput: styles.textInput,
          container: styles.autocompleteContainer,
        }}
        textInputProps={{
          placeholderTextColor: colors.textHint,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1,
  },
  autocompleteContainer: {
    flex: 0,
  },
  textInput: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    textAlign: 'right',
    color: colors.primaryNavy,
  },
});

export default AddressInput;