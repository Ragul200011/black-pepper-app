import { Platform } from "react-native";
import { API_BASE } from "../config/api";

export async function predictImage(uri) {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append("image", blob, "image.jpg");  
  } else {
    formData.append("image", {                     
      uri,
      name: "image.jpg",
      type: "image/jpeg",
    });
  }

  const res = await fetch(`${API_BASE}/api/variety-predict`, { 
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const txt = await res.text();
    console.log("Backend error:", txt);
    throw new Error(txt);
  }

  const data = await res.json();

  // Map backend response to what VarietyIdentifyScreen expects
  return {
    result: data.prediction?.label ?? "Unknown",
    confidence: data.prediction?.confidence ?? 0,
    stage: data.stageA?.label ?? "unknown",
    message: data.message ?? "",
    variety_probs: data.probabilities ?? {},
    stageA_probs: data.stageA
      ? {
          [data.stageA.label]: data.stageA.confidence,
        }
      : {},
    stageA_warning: data.stageA_warning ?? null,
    accepted: data.accepted,
  };
}