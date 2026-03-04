import { createContext, useContext } from 'react';

type StartTeleconsultaFn = (patientName?: string, hasTeleconsulta?: boolean) => void;

const TeleconsultaContext = createContext<StartTeleconsultaFn>(() => {});

export const TeleconsultaProvider = TeleconsultaContext.Provider;
export const useTeleconsulta = () => useContext(TeleconsultaContext);
