// 1. מייבאים את הדף שיצרנו מהתיקייה שלו
import WelcomePage from './pages/WelcomePage';

function App() {
  return (
    <div>
      {/* 2. מציגים את דף הפתיחה כרכיב הראשי */}
      <WelcomePage />
    </div>
  );
}

export default App;