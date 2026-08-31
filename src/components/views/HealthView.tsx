import React, { useState } from "react";
import { Activity, Pill, HeartPulse, Plus, Download, AlertCircle, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { HealthMeasurement, HealthMeasureType, Medication, MedicationDosageUnit, MedicationForm, MedicationFrequency, MedicationFoodInstruction } from "../../types";
import { NixCard, NixModal } from "../ui/NixUi";

export const HealthView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  // Measurement Modal
  const [isMeasModalOpen, setIsMeasModalOpen] = useState(false);
  const [measType, setMeasType] = useState<HealthMeasureType>("Weight");
  const [primaryVal, setPrimaryVal] = useState<number>(70);
  const [secondaryVal, setSecondaryVal] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState("kg");
  const [measDate, setMeasDate] = useState(new Date().toISOString().split("T")[0]);
  const [measTime, setMeasTime] = useState("08:00");

  // Medication Modal
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [medName, setMedName] = useState("");
  const [dosageVal, setDosageVal] = useState("1");
  const [dosageUnit, setDosageUnit] = useState<MedicationDosageUnit>("mg");
  const [medForm, setMedForm] = useState<MedicationForm>("Tablet");
  const [frequency, setFrequency] = useState<MedicationFrequency>("Once daily");
  const [foodInstruction, setFoodInstruction] = useState<MedicationFoodInstruction>("With food");
  const [refillQty, setRefillQty] = useState<number>(30);
  const [refillThresh, setRefillThresh] = useState<number>(5);
  const [doctor, setDoctor] = useState("");
  const [pharmacy, setPharmacy] = useState("");
  const [formError, setFormError] = useState("");

  const measurements = nixStorage.getHealthMeasurements();
  const medications = nixStorage.getMedications();
  const todayStr = new Date().toISOString().split("T")[0];

  const handleSaveMeasurement = () => {
    if (primaryVal === undefined || primaryVal < 0) {
      setFormError("Valid primary value is required.");
      return;
    }

    nixStorage.saveHealthMeasurement({
      measureType: measType,
      primaryValue: primaryVal,
      secondaryValue: measType === "Blood Pressure" ? secondaryVal : undefined,
      unit,
      measuredDate: measDate,
      measuredTime: measTime,
    });

    setIsMeasModalOpen(false);
    refresh();
  };

  const handleSaveMedication = () => {
    if (!medName.trim()) {
      setFormError("Medication Name is required.");
      return;
    }

    nixStorage.saveMedication({
      medicationName: medName.trim(),
      dosageValue: dosageVal,
      dosageUnit: dosageUnit,
      medicationForm: medForm,
      frequencyType: frequency,
      foodInstruction: foodInstruction,
      refillQuantity: refillQty,
      refillThreshold: refillThresh,
      prescribingDoctor: doctor,
      pharmacy: pharmacy,
      scheduleTimes: ["08:00"],
    });

    setIsMedModalOpen(false);
    refresh();
  };

  const handleLogMedicationTaken = (medId: string) => {
    nixStorage.logMedicationStatus(medId, `${todayStr} 08:00`, "Taken");
    refresh();
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm("Delete medication?")) {
      nixStorage.deleteMedication(id);
      refresh();
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    if (window.confirm("Delete health measurement?")) {
      nixStorage.deleteHealthMeasurement(id);
      refresh();
    }
  };

  const handleExportDoctorReport = () => {
    const reportText =
      `NIX LIFE OS - DOCTOR READY HEALTH SUMMARY REPORT\n` +
      `Generated Date: ${new Date().toLocaleDateString()}\n\n` +
      `ACTIVE MEDICATIONS & PRESCRIPTIONS:\n` +
      medications
        .map(
          (m) =>
            `- ${m.medicationName} ${m.dosageValue}${m.dosageUnit} (${m.medicationForm}): ${m.frequencyType}, ${m.foodInstruction}. Remaining: ${m.refillQuantity} (Doctor: ${m.prescribingDoctor || "N/A"})`
        )
        .join("\n") +
      `\n\nRECENT HEALTH VITALS & MEASUREMENTS:\n` +
      measurements
        .slice(0, 10)
        .map((m) => `- ${m.measuredDate} ${m.measuredTime}: ${m.measureType} = ${m.primaryValue}${m.secondaryValue ? "/" + m.secondaryValue : ""} ${m.unit}`)
        .join("\n");

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nix_Health_Doctor_Report_${todayStr}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" /> HEALTH & MEDICATION MANAGEMENT
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Track vitals, manage prescriptions, monitor refill thresholds, and generate doctor reports.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDoctorReport}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-rose-400" /> Export Doctor Summary
          </button>
          <button
            onClick={() => {
              setFormError("");
              setIsMedModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-rose-400" /> Add Prescription
          </button>
          <button
            onClick={() => {
              setFormError("");
              setIsMeasModalOpen(true);
            }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Vital Metric
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication Schedule Column */}
        <NixCard className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4" /> Prescriptions & Medication Schedule ({medications.length})
          </h3>

          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 py-8 text-center">No active prescriptions registered.</p>
            ) : (
              medications.map((m) => {
                const isLowRefill = m.refillQuantity <= m.refillThreshold;
                const isTakenToday = m.logs && m.logs[`${todayStr} 08:00`] === "Taken";

                return (
                  <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">
                          {m.medicationName} ({m.dosageValue} {m.dosageUnit})
                        </h4>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {m.medicationForm} • {m.frequencyType} • {m.foodInstruction}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMedication(m.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800">
                      <span className={isLowRefill ? "text-rose-400 font-bold flex items-center gap-1" : "text-slate-400"}>
                        {isLowRefill && <AlertCircle className="w-3 h-3" />} Refill Remaining: {m.refillQuantity} units
                      </span>

                      <button
                        onClick={() => handleLogMedicationTaken(m.id)}
                        disabled={isTakenToday}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          isTakenToday ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500 text-slate-950 hover:bg-rose-400"
                        }`}
                      >
                        {isTakenToday ? "Taken Today" : "Mark Taken"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </NixCard>

        {/* Health Measurements Column */}
        <NixCard className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <HeartPulse className="w-4 h-4" /> Vitals & Measurements History ({measurements.length})
          </h3>

          <div className="space-y-2.5">
            {measurements.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 py-8 text-center">No vital measurements logged yet.</p>
            ) : (
              measurements.map((hm) => (
                <div key={hm.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-xs font-bold text-slate-100">{hm.measureType}</span>
                    <div className="text-[10px] text-slate-400">
                      {hm.measuredDate} at {hm.measuredTime}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-rose-400">
                      {hm.primaryValue}
                      {hm.secondaryValue ? `/${hm.secondaryValue}` : ""} {hm.unit}
                    </span>
                    <button onClick={() => handleDeleteMeasurement(hm.id)} className="text-slate-500 hover:text-rose-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </NixCard>
      </div>

      {/* Measurement Modal */}
      <NixModal isOpen={isMeasModalOpen} onClose={() => setIsMeasModalOpen(false)} title="Log Health Measurement">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Measurement Type</label>
            <select
              value={measType}
              onChange={(e) => {
                const mt = e.target.value as HealthMeasureType;
                setMeasType(mt);
                if (mt === "Weight") setUnit("kg");
                else if (mt === "Blood Pressure") setUnit("mmHg");
                else if (mt === "Water") setUnit("ml");
                else if (mt === "Sleep") setUnit("hours");
                else if (mt === "Daily Walk") setUnit("steps");
                else if (mt === "Daily Calories") setUnit("kcal");
              }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            >
              <option value="Weight">Weight</option>
              <option value="Blood Pressure">Blood Pressure</option>
              <option value="Water">Water Intake</option>
              <option value="Sleep">Sleep Duration</option>
              <option value="Daily Walk">Daily Walk Step Count</option>
              <option value="Daily Calories">Daily Calories</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                {measType === "Blood Pressure" ? "Systolic Value" : "Primary Value"} *
              </label>
              <input
                type="number"
                value={primaryVal}
                onChange={(e) => setPrimaryVal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>

            {measType === "Blood Pressure" ? (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Diastolic Value</label>
                <input
                  type="number"
                  value={secondaryVal || 80}
                  onChange={(e) => setSecondaryVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsMeasModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveMeasurement} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-rose-500 text-slate-950 hover:bg-rose-400">
              Save Measurement
            </button>
          </div>
        </div>
      </NixModal>

      {/* Medication Modal */}
      <NixModal isOpen={isMedModalOpen} onClose={() => setIsMedModalOpen(false)} title="Add Prescription / Medication">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Medication Name *</label>
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Lisinopril 10mg"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Dosage Value</label>
              <input
                type="text"
                value={dosageVal}
                onChange={(e) => setDosageVal(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Dosage Unit</label>
              <select
                value={dosageUnit}
                onChange={(e) => setDosageUnit(e.target.value as MedicationDosageUnit)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Drop">Drop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Refill Quantity</label>
              <input
                type="number"
                value={refillQty}
                onChange={(e) => setRefillQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Alert Threshold</label>
              <input
                type="number"
                value={refillThresh}
                onChange={(e) => setRefillThresh(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsMedModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveMedication} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-rose-500 text-slate-950 hover:bg-rose-400">
              Save Prescription
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
