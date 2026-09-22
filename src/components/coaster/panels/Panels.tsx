'use client';

import React, { useState } from 'react';
import { msg, useMessages } from 'gt-next';
import { useCoaster } from '@/context/CoasterContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

// Translatable labels
const UI_LABELS = {
  cash: msg('Cash'),
  profit: msg('Profit'),
  admissions: msg('Admissions'),
  rideTickets: msg('Ride Tickets'),
  foodAndDrinks: msg('Food & Drinks'),
  shops: msg('Shops'),
  upkeep: msg('Upkeep'),
  wages: msg('Wages'),
  recentMonths: msg('Recent Months'),
  parkSettings: msg('Park Settings'),
  entranceFee: msg('Entrance Fee'),
  payPerRideDisabled: msg('Disabled while pay-per-ride is enabled.'),
  payPerRide: msg('Pay Per Ride'),
  payPerRideDesc: msg('Charge guests per ride instead of admission'),
  clearAllGuests: msg('Clear All Guests'),
  removeAllGuests: msg('Remove all guests from the park'),
  guestsWord: msg('guests'),
  clear: msg('Clear'),
  parkInformation: msg('Park Information'),
  parkName: msg('Park Name'),
  gridSize: msg('Grid Size'),
  autoSave: msg('Auto-Save'),
  enabled: msg('Enabled'),
  startNewPark: msg('Start New Park'),
  resetConfirm: msg('Are you sure? This will reset all progress.'),
  cancel: msg('Cancel'),
  reset: msg('Reset'),
  exportGame: msg('Export Game'),
  exportDesc: msg('Copy your game state to share or backup'),
  copied: msg('✓ Copied!'),
  copyGameState: msg('Copy Game State'),
  importGame: msg('Import Game'),
  importDesc: msg('Paste a game state to load it'),
  pasteHere: msg('Paste game state here...'),
  invalidState: msg('Invalid game state. Please check and try again.'),
  loaded: msg('Game loaded successfully!'),
  loadGameState: msg('Load Game State'),
  developerTools: msg('Developer Tools'),
  loadExample: msg('Load Example State'),
  loadExample2: msg('Load Example State 2'),
};

function PanelWrapper({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const m = useMessages();
  return (
    <Card className="absolute top-20 right-8 w-[360px] bg-slate-950/95 border-slate-700 shadow-xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">{m(title)}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-white/60 hover:text-white">
          ✕
        </Button>
      </div>
      <ScrollArea className="max-h-[360px]">
        <div className="p-4 space-y-4">{children}</div>
      </ScrollArea>
    </Card>
  );
}

function FinancesPanel({ onClose }: { onClose: () => void }) {
  const { state } = useCoaster();
  const { finances } = state;
  const m = useMessages();

  return (
    <PanelWrapper title="Finances" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-white/50 text-xs uppercase">{m(UI_LABELS.cash)}</div>
          <div className="text-green-400 font-semibold">{formatCurrency(finances.cash)}</div>
        </div>
        <div>
          <div className="text-white/50 text-xs uppercase">{m(UI_LABELS.profit)}</div>
          <div className={`font-semibold ${finances.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(finances.profit)}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-white/80">
          <span>{m(UI_LABELS.admissions)}</span>
          <span className="text-green-300">{formatCurrency(finances.incomeAdmissions)}</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>{m(UI_LABELS.rideTickets)}</span>
          <span className="text-green-300">{formatCurrency(finances.incomeRides)}</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>{m(UI_LABELS.foodAndDrinks)}</span>
          <span className="text-green-300">{formatCurrency(finances.incomeFood)}</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>{m(UI_LABELS.shops)}</span>
          <span className="text-green-300">{formatCurrency(finances.incomeShops)}</span>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between text-white/70">
          <span>{m(UI_LABELS.upkeep)}</span>
          <span className="text-red-300">{formatCurrency(finances.expenseUpkeep)}</span>
        </div>
        <div className="flex items-center justify-between text-white/70">
          <span>{m(UI_LABELS.wages)}</span>
          <span className="text-red-300">{formatCurrency(finances.expenseWages)}</span>
        </div>
      </div>

      {finances.history.length > 0 && (
        <div>
          <div className="text-xs uppercase text-white/50 tracking-wide mb-2">{m(UI_LABELS.recentMonths)}</div>
          <div className="space-y-2 text-xs text-white/70">
            {finances.history.slice(-4).map(point => (
              <div key={`${point.month}-${point.year}`} className="flex justify-between">
                <span>Y{point.year} M{point.month}</span>
                <span className={point.profit >= 0 ? 'text-green-300' : 'text-red-300'}>
                  {formatCurrency(point.profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PanelWrapper>
  );
}

// Helper function to load example state with proper error handling
async function loadExampleState(
  filename: string,
  loadState: (stateString: string) => boolean,
  setActivePanel: (panel: 'none' | 'finances' | 'guests' | 'rides' | 'staff' | 'settings') => void
): Promise<void> {
  try {
    const response = await fetch(`/example-states-coaster/${filename}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${filename}:`, response.status);
      alert(`Failed to load example state: ${response.status}`);
      return;
    }
    const exampleState = await response.json();
    const success = loadState(JSON.stringify(exampleState));
    if (success) {
      setActivePanel('none');
    } else {
      console.error('loadState returned false - invalid state format for', filename);
      alert('Failed to load example state: invalid format');
    }
  } catch (e) {
    console.error('Error loading example state:', e);
    alert(`Error loading example state: ${e}`);
  }
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { state, setParkSettings, exportState, loadState, setActivePanel, newGame, addMoney, clearGuests } = useCoaster();
  const { settings, gridSize } = state;
  
  const [importValue, setImportValue] = useState('');
  const [exportCopied, setExportCopied] = useState(false);
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [newParkName, setNewParkName] = useState(settings.name);
  const m = useMessages();
  
  const handleCopyExport = async () => {
    const exported = exportState();
    await navigator.clipboard.writeText(exported);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };
  
  const handleImport = () => {
    setImportError(false);
    setImportSuccess(false);
    if (importValue.trim()) {
      const success = loadState(importValue.trim());
      if (success) {
        setImportSuccess(true);
        setImportValue('');
        setTimeout(() => setImportSuccess(false), 2000);
      } else {
        setImportError(true);
      }
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[400px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{m('Settings')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Park Settings */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{m(UI_LABELS.parkSettings)}</div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{m(UI_LABELS.entranceFee)}</label>
                <Input
                  type="number"
                  min={0}
                  value={settings.entranceFee}
                  onChange={(e) => setParkSettings({ entranceFee: Math.max(0, Number(e.target.value)) })}
                  className="mt-1"
                  disabled={settings.payPerRide}
                />
                {settings.payPerRide && (
                  <p className="text-xs text-muted-foreground mt-1">{m(UI_LABELS.payPerRideDisabled)}</p>
                )}
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{m(UI_LABELS.payPerRide)}</div>
                  <p className="text-xs text-muted-foreground">{m(UI_LABELS.payPerRideDesc)}</p>
                </div>
                <Switch
                  checked={settings.payPerRide}
                  onCheckedChange={(checked) =>
                    setParkSettings({
                      payPerRide: checked,
                      entranceFee: checked ? 0 : settings.entranceFee,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{m(UI_LABELS.clearAllGuests)}</div>
                  <p className="text-xs text-muted-foreground">{m(UI_LABELS.removeAllGuests)} ({state.guests.length} {m(UI_LABELS.guestsWord)})</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearGuests}
                >
                  {m(UI_LABELS.clear)}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Park Information */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{m(UI_LABELS.parkInformation)}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{m(UI_LABELS.parkName)}</span>
                <span className="text-foreground">{settings.name}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{m(UI_LABELS.gridSize)}</span>
                <span className="text-foreground">{gridSize} x {gridSize}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{m(UI_LABELS.autoSave)}</span>
                <span className="text-green-400">{m(UI_LABELS.enabled)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* New Game */}
          {!showNewGameConfirm ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowNewGameConfirm(true)}
            >
              {m(UI_LABELS.startNewPark)}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm text-center">{m(UI_LABELS.resetConfirm)}</p>
              <Input
                value={newParkName}
                onChange={(e) => setNewParkName(e.target.value)}
                placeholder={m('New park name...')}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewGameConfirm(false)}
                >
                  {m(UI_LABELS.cancel)}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    newGame(newParkName || 'My Theme Park');
                    setActivePanel('none');
                  }}
                >
                  {m(UI_LABELS.reset)}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Export Game */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{m(UI_LABELS.exportGame)}</div>
            <p className="text-muted-foreground text-xs mb-2">{m(UI_LABELS.exportDesc)}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopyExport}
            >
              {exportCopied ? m(UI_LABELS.copied) : m(UI_LABELS.copyGameState)}
            </Button>
          </div>

          {/* Import Game */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{m(UI_LABELS.importGame)}</div>
            <p className="text-muted-foreground text-xs mb-2">{m(UI_LABELS.importDesc)}</p>
            <textarea
              className="w-full h-20 bg-background border border-border rounded-md p-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder={m(UI_LABELS.pasteHere)}
              value={importValue}
              onChange={(e) => {
                setImportValue(e.target.value);
                setImportError(false);
                setImportSuccess(false);
              }}
            />
            {importError && (
              <p className="text-red-400 text-xs mt-1">{m(UI_LABELS.invalidState)}</p>
            )}
            {importSuccess && (
              <p className="text-green-400 text-xs mt-1">{m(UI_LABELS.loaded)}</p>
            )}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleImport}
              disabled={!importValue.trim()}
            >
              {m(UI_LABELS.loadGameState)}
            </Button>
          </div>

          <Separator />

          {/* Developer Tools */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{m(UI_LABELS.developerTools)}</div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => loadExampleState('example_state.json', loadState, setActivePanel)}
              >
                {m(UI_LABELS.loadExample)}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => loadExampleState('example_state_2.json', loadState, setActivePanel)}
              >
                {m(UI_LABELS.loadExample2)}
              </Button>
              <Button
                variant="outline"
                className="w-full text-green-400 hover:text-green-300"
                onClick={() => addMoney(500000)}
              >
                +$500k (Cheat)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Panels() {
  const { state, setActivePanel } = useCoaster();
  
  if (state.activePanel === 'finances') {
    return <FinancesPanel onClose={() => setActivePanel('none')} />;
  }
  
  if (state.activePanel === 'settings') {
    return <SettingsPanel onClose={() => setActivePanel('none')} />;
  }
  
  return null;
}
