import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, TextInput } from 'react-native';

interface AddressInputProps {
  placeholder: string;
  onAddressSelect: (address: string, details?: any) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ placeholder, onAddressSelect }) => {
  // רפרנס לשמירת אלמנט האינפוט כשאנחנו רצים בדפדפן
  const inputRef = useRef<any>(null);

  useEffect(() => {
    // הפעלה של המנוע הטבעי של גוגל, אך ורק אם אנחנו ב-Web והסקריפט מ-+html.tsx נטען בהצלחה
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).google) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'il' },
        fields: ['formatted_address', 'geometry', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        onAddressSelect(place.name || place.formatted_address || '', place);
      });
    }
  }, []);

  // -- ריצה בדפדפן (Web) --
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* @ts-ignore - שימוש בתגית HTML רגילה בסביבת ווב כדי שגוגל יוכל להתלבש עליה */}
        <input
          ref={inputRef}
          placeholder={placeholder}
          style={{
            height: 50,
            borderRadius: 8,
            padding: '0 16px',
            backgroundColor: '#f5f5f5',
            fontSize: 16,
            borderWidth: 1,
            borderColor: '#e0e0e0',
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            textAlign: 'right'
          }}
        />
      </View>
    );
  }

  // -- ריצה בנייד (Mobile) --
  // הייבוא נעשה כאן למטה באופן דינמי (require) כדי שהדפדפן לא ינסה לטעון את הספרייה ויקרוס
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
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'right',
  },
});

export default AddressInput;