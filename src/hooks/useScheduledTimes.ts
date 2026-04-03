/**
 * Hook para buscar e calcular horários programados
 */

import { useState, useEffect } from 'react';

interface ScheduledTime {
  id: string;
  time: string;
  stopId: string;
  stopName: string;
  dayOfWeek: string;
  direction: string;
}

interface NextSchedule {
  nextTime: string | null;
  nextStop: string | null;
  minutesUntil: number | null;
  lastTime: string | null;
  lastStop: string | null;
}

export function useScheduledTimes(lineId: string | undefined) {
  const [schedules, setSchedules] = useState<ScheduledTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextSchedule, setNextSchedule] = useState<NextSchedule>({
    nextTime: null,
    nextStop: null,
    minutesUntil: null,
    lastTime: null,
    lastStop: null,
  });

  useEffect(() => {
    if (!lineId) return;

    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/lines/${lineId}/schedules`);
        const data = await response.json();

        if (data.success) {
          setSchedules(data.data);
          calculateNextSchedule(data.data);
        }
      } catch (error) {
        console.error('Erro ao buscar horários:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();

    // Atualizar a cada minuto
    const interval = setInterval(() => {
      if (schedules.length > 0) {
        calculateNextSchedule(schedules);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lineId]);

  const calculateNextSchedule = (scheduleList: ScheduledTime[]) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Filtrar horários de hoje (weekday, saturday, sunday)
    const dayOfWeek = now.getDay();
    let dayType = 'weekday';
    if (dayOfWeek === 0) dayType = 'sunday';
    if (dayOfWeek === 6) dayType = 'saturday';

    const todaySchedules = scheduleList.filter(s => s.dayOfWeek === dayType);

    // Ordenar por horário
    const sorted = todaySchedules.sort((a, b) => a.time.localeCompare(b.time));

    // Encontrar próximo horário
    const next = sorted.find(s => s.time > currentTime);
    
    // Encontrar último horário passado
    const past = sorted.filter(s => s.time <= currentTime);
    const last = past.length > 0 ? past[past.length - 1] : null;

    if (next) {
      const [nextHour, nextMin] = next.time.split(':').map(Number);
      const nextDate = new Date(now);
      nextDate.setHours(nextHour, nextMin, 0, 0);
      
      const diffMs = nextDate.getTime() - now.getTime();
      const minutesUntil = Math.round(diffMs / 60000);

      setNextSchedule({
        nextTime: next.time,
        nextStop: next.stopName,
        minutesUntil,
        lastTime: last?.time || null,
        lastStop: last?.stopName || null,
      });
    } else {
      // Não há mais horários hoje
      setNextSchedule({
        nextTime: null,
        nextStop: null,
        minutesUntil: null,
        lastTime: last?.time || null,
        lastStop: last?.stopName || null,
      });
    }
  };

  return {
    schedules,
    loading,
    nextSchedule,
  };
}
