import { SchedulePage, Header } from '@playwales/shared';
import styles from './App.module.css';

function App() {


  return (
    <div className={styles.appRoot}>
      <Header />
      <div className={styles.appContainer}>
        <SchedulePage />
      </div>
    </div>
  );
}

export default App;