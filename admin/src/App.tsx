import { SchedulePage, HeaderAdmin } from '@playwales/shared';
import styles from './App.module.css';

function App() {


  return (
    <div className={styles.appRoot}>
      <HeaderAdmin />
      <div className={styles.appContainer}>
        <SchedulePage />
      </div>
    </div>
  );
}

export default App;