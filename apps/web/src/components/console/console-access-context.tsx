'use client';

import { createContext, useContext } from 'react';

import type { ConsoleAccess } from '@/types/console.types';

const ConsoleAccessContext = createContext<ConsoleAccess | null>(null);

export const ConsoleAccessProvider = ConsoleAccessContext.Provider;

export const useConsoleAccess = (): ConsoleAccess | null => useContext(ConsoleAccessContext);
