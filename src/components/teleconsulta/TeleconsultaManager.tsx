import { useState, useCallback } from 'react';
import { UserRole } from '@/types/calendar';
import { TeleconsultaCall } from './TeleconsultaCall';
import { PreCallModal } from './PreCallModal';
import { IncomingCallModal } from './IncomingCallModal';
import { WaitingRoom } from './WaitingRoom';
import { PostCallSummary } from './PostCallSummary';
import { NoTeleconsultaModal } from './NoTeleconsultaModal';
import { TeleconsultaProvider } from '@/contexts/TeleconsultaContext';
import { toast } from 'sonner';

type TeleconsultaState = 'idle' | 'pre-call' | 'incoming' | 'waiting' | 'in-call' | 'post-call' | 'no-teleconsulta';

interface TeleconsultaManagerProps {
  userRole: UserRole;
  children: (startTeleconsulta: (patientName?: string, hasTeleconsulta?: boolean) => void) => React.ReactNode;
}

export function TeleconsultaManager({ userRole, children }: TeleconsultaManagerProps) {
  const [state, setState] = useState<TeleconsultaState>('idle');
  const [callStartTime, setCallStartTime] = useState<number>(0);
  const [callDuration, setCallDuration] = useState('');
  const [currentPatient, setCurrentPatient] = useState('Ana Ferreira');
  const isDentist = userRole === 'dentist' || userRole === 'clinic';
  const dentistName = 'Dr. Gonçalo Pipo';

  const startTeleconsulta = useCallback((patientName?: string, hasTeleconsulta: boolean = true) => {
    const name = patientName || 'Ana Ferreira';
    setCurrentPatient(name);

    if (!hasTeleconsulta && isDentist) {
      setState('no-teleconsulta');
      return;
    }

    if (isDentist) {
      setState('pre-call');
    } else {
      // Patient: show incoming call
      setState('incoming');
    }
  }, [isDentist]);

  const handleStartCall = useCallback(() => {
    setCallStartTime(Date.now());
    setState('in-call');
    toast.success('Teleconsulta iniciada');
  }, []);

  const handleAcceptCall = useCallback(() => {
    setCallStartTime(Date.now());
    setState('in-call');
  }, []);

  const handleEndCall = useCallback(() => {
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    setCallDuration(`${min} min ${sec.toString().padStart(2, '0')} seg`);
    setState('post-call');
  }, [callStartTime]);

  const handleCreateQuick = useCallback(() => {
    setState('idle');
    toast.success('Teleconsulta rápida criada. A iniciar...');
    setTimeout(() => {
      setState('pre-call');
    }, 500);
  }, []);

  return (
    <TeleconsultaProvider value={startTeleconsulta}>
      {children(startTeleconsulta)}

      <PreCallModal
        isOpen={state === 'pre-call'}
        onClose={() => setState('idle')}
        onStart={handleStartCall}
        patientName={currentPatient}
      />

      <IncomingCallModal
        isOpen={state === 'incoming'}
        dentistName={dentistName}
        onAccept={handleAcceptCall}
        onReject={() => { setState('idle'); toast.info('Chamada recusada'); }}
      />

      <WaitingRoom
        isOpen={state === 'waiting'}
        dentistName={dentistName}
        onLeave={() => setState('idle')}
      />

      {state === 'in-call' && (
        <TeleconsultaCall
          userRole={userRole}
          patientName={currentPatient}
          dentistName={dentistName}
          onEnd={handleEndCall}
        />
      )}

      <PostCallSummary
        isOpen={state === 'post-call'}
        onClose={() => setState('idle')}
        isDentist={isDentist}
        remoteName={isDentist ? currentPatient : dentistName}
        duration={callDuration || '0 min 00 seg'}
      />

      <NoTeleconsultaModal
        isOpen={state === 'no-teleconsulta'}
        onClose={() => setState('idle')}
        onCreate={handleCreateQuick}
        patientName={currentPatient}
      />
    </TeleconsultaProvider>
  );
}
