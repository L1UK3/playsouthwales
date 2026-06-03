import { SchedulePage, useScheduleState, Header } from '@playwales/shared';
import styles from './App.module.css';

function App() {
  const scheduleState = useScheduleState();

  return (
    <div className={styles.appRoot}>
      <Header />
      <div className={styles.appContainer}>
        <SchedulePage {...scheduleState} />
      </div>
    </div>
  );
}

export default App;