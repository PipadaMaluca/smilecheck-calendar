import { describe, it, expect, afterEach } from 'vitest';
import i18n from '@/i18n';
import { STATUS_CONFIG } from '@/types/calendar';

afterEach(() => i18n.changeLanguage('pt'));

describe('Agenda texts follow the active language', () => {
  it('appointment counter uses correct plurals', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('agenda.consultationCount', { count: 1 })).toBe('1 appointment');
    expect(i18n.t('agenda.consultationCount', { count: 5 })).toBe('5 appointments');
    await i18n.changeLanguage('pt');
    expect(i18n.t('agenda.consultationCount', { count: 1 })).toBe('1 consulta');
    expect(i18n.t('agenda.consultationCount', { count: 5 })).toBe('5 consultas');
  });
  it('lunch block and status pills are translated', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('agenda.lunchBlock')).toBe('DÉJEUNER');
    expect(STATUS_CONFIG.confirmada.label).toBe('Confirmé');
    await i18n.changeLanguage('en');
    expect(STATUS_CONFIG.agendada.label).toBe('Scheduled');
  });
  it('French absence wording uses the approved terms everywhere', async () => {
    await i18n.changeLanguage('fr');
    expect(STATUS_CONFIG.falta_justificada.label).toBe('Absence excusée');
    expect(STATUS_CONFIG.falta_nao_justificada.label).toBe('Absence non excusée');
    expect(i18n.t('contextMenu.justifiedAbsence')).toBe('Absence excusée');
    expect(i18n.t('contextMenu.unjustifiedAbsence')).toBe('Absence non excusée');
    expect(i18n.t('patientStatuses.noShowExcused')).toBe('Absence (excusée)');
    expect(i18n.t('patientStatuses.noShowUnexcused')).toBe('Absence (non excusée)');
    expect(i18n.t('pointsRules.falta')).toBe('Absence non excusée');
    expect(i18n.t('pointsRules.falta_base')).toBe('Absence non excusée (base)');
    expect(i18n.t('demoText.falta_nao_justificada')).toBe('Absence non excusée');
  });
});
