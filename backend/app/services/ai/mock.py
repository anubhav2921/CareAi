from typing import Dict, Any, Optional
from .base import MedicalAnalysisService


class MockMedicalAnalysisService(MedicalAnalysisService):
    """
    Deterministic mock AI service that returns patient-friendly, localized explanations
    for CBC parameters. No real LLM is used. Explanations are structured into four parts:
      - what_is_this: what the test measures
      - what_did_report_show: what the actual value means relative to the range
      - what_this_means: simple, safe, uncertainty-aware interpretation
      - should_i_worry: calm, honest guidance (abnormal results only)

    Each explanation is returned as a structured dict (not a collapsed string), enabling
    the frontend to render each section independently.
    """

    # ── Patient-friendly parameter descriptions ─────────────────────────────

    PARAM_DESCRIPTIONS: Dict[str, Dict[str, Any]] = {
        "Hemoglobin": {
            "full_name": {
                "en": "Hemoglobin (Hb)",
                "hi": "Hemoglobin (Hb)",
                "hinglish": "Hemoglobin (Hb)"
            },
            "what_is_this": {
                "en": "Think of hemoglobin as the part of your blood that carries oxygen around your body. It lives inside your red blood cells and picks up oxygen in your lungs, then delivers it to your muscles, organs, and tissues.",
                "hi": "Hemoglobin को अपने खून के उस हिस्से के रूप में सोचें जो आपके पूरे शरीर में oxygen पहुँचाता है। यह आपके red blood cells में रहता है और फेफड़ों से oxygen लेकर आपकी मांसपेशियों, अंगों और ऊतकों तक पहुँचाता है।",
                "hinglish": "Hemoglobin ko apne blood ke us hisse ke taur par socho jo poore body mein oxygen pohonchata hai. Yeh red blood cells mein rehta hai aur lungs se oxygen lekar muscles, organs aur tissues tak pohonchata hai."
            },
            "below_range": {
                "what_did_report_show": {
                    "en": "Your hemoglobin level is lower than the range printed on this report.",
                    "hi": "आपका hemoglobin स्तर, इस रिपोर्ट में दी गई सीमा से कम है।",
                    "hinglish": "Aapka hemoglobin level, is report mein di gayi range se kam hai."
                },
                "what_this_means": {
                    "en": "When hemoglobin sits below the reference range, it can sometimes mean that red blood cells are carrying a little less oxygen than usual. This can happen for several reasons — including diet, iron levels, recent illness, hydration, or other factors. One result alone cannot tell us the cause, and your doctor will look at this alongside your other results and how you feel.",
                    "hi": "जब hemoglobin reference range से कम होता है, तो कभी-कभी इसका मतलब हो सकता है कि red blood cells सामान्य से थोड़ी कम oxygen ले जा रहे हैं। इसके कई कारण हो सकते हैं — जैसे खान-पान, iron का स्तर, हाल की बीमारी, या अन्य कारण। अकेला यह परिणाम कारण नहीं बता सकता और आपके डॉक्टर इसे बाकी परिणामों और आपके लक्षणों के साथ देखेंगे।",
                    "hinglish": "Jab hemoglobin reference range se kam hota hai, kabhi-kabhi iska matlab ho sakta hai ki red blood cells thodi kam oxygen le jaa rahe hain. Iske kai reasons ho sakte hain — jaise diet, iron levels, recent illness, ya aur factors. Akela yeh result wajah nahi bata sakta aur aapke doctor ise baaki results aur symptoms ke saath dekhenge."
                },
                "should_i_worry": {
                    "en": "A lower-than-range result does not automatically mean something is seriously wrong. Many things can affect hemoglobin, and mild changes are common. If you are experiencing unusual tiredness, weakness, shortness of breath, or dizziness, mention these to your doctor — they will decide whether any follow-up is needed.",
                    "hi": "सीमा से कम परिणाम का मतलब अपने आप कुछ गंभीर नहीं है। कई चीज़ें hemoglobin को प्रभावित कर सकती हैं और हल्के बदलाव सामान्य हैं। यदि आप असामान्य थकान, कमज़ोरी, सांस लेने में तकलीफ़ या चक्कर महसूस कर रहे हैं, तो अपने डॉक्टर को बताएँ — वे तय करेंगे कि कोई जाँच ज़रूरी है या नहीं।",
                    "hinglish": "Range se kam result ka matlab apne aap kuch serious nahi hai. Kai cheezein hemoglobin ko affect kar sakti hain aur mild changes common hain. Agar aap unusual thakaan, kamzori, saans lene mein takleef, ya chakkar feel kar rahe hain, to apne doctor ko batao — woh decide karenge ki koi follow-up zaroori hai ya nahi."
                },
                "doctor_questions": {
                    "en": "Could my slightly low hemoglobin be related to my symptoms, and would you recommend repeating the test?",
                    "hi": "क्या मेरा थोड़ा कम hemoglobin मेरे लक्षणों से जुड़ा हो सकता है, और क्या test दोहराने की ज़रूरत है?",
                    "hinglish": "Kya mera thoda kam hemoglobin mere symptoms se related ho sakta hai, aur kya test repeat karna chahiye?"
                }
            },
            "above_range": {
                "what_did_report_show": {
                    "en": "Your hemoglobin level is higher than the range printed on this report.",
                    "hi": "आपका hemoglobin स्तर, इस रिपोर्ट में दी गई सीमा से अधिक है।",
                    "hinglish": "Aapka hemoglobin level, is report mein di gayi range se zyada hai."
                },
                "what_this_means": {
                    "en": "A hemoglobin level above the reference range can happen for various reasons, including being at high altitude, being dehydrated, or other factors. Your doctor will look at this result alongside your other values and your medical history.",
                    "hi": "Reference range से अधिक hemoglobin कई कारणों से हो सकता है — जैसे ऊँचाई पर रहना, शरीर में पानी की कमी, या अन्य कारण। आपके डॉक्टर इस परिणाम को बाकी मूल्यों और आपके चिकित्सीय इतिहास के साथ देखेंगे।",
                    "hinglish": "Reference range se zyada hemoglobin kai reasons se ho sakta hai — jaise pahadi ilake mein rehna, dehydration, ya aur factors. Aapke doctor is result ko baaki values aur aapki medical history ke saath dekhenge."
                },
                "should_i_worry": {
                    "en": "A higher-than-range result does not always mean there is a medical problem. Your doctor will be able to tell you whether this needs any follow-up.",
                    "hi": "सीमा से अधिक परिणाम का मतलब हमेशा कोई चिकित्सीय समस्या नहीं होता। आपके डॉक्टर आपको बताएँगे कि इसके लिए कोई जाँच ज़रूरी है या नहीं।",
                    "hinglish": "Range se zyada result ka matlab hamesha koi medical problem nahi hota. Aapke doctor batayenge ki koi follow-up zaroori hai ya nahi."
                },
                "doctor_questions": {
                    "en": "Why might my hemoglobin be higher than the range shown, and is any follow-up needed?",
                    "hi": "मेरा hemoglobin रिपोर्ट की सीमा से अधिक क्यों हो सकता है, और क्या कोई जाँच ज़रूरी है?",
                    "hinglish": "Mera hemoglobin report ki range se zyada kyun ho sakta hai, aur kya koi follow-up zaroori hai?"
                }
            },
            "within_range": {
                "what_did_report_show": {
                    "en": "Your hemoglobin level is within the range shown on this report.",
                    "hi": "आपका hemoglobin स्तर, इस रिपोर्ट में दी गई सीमा के अंदर है।",
                    "hinglish": "Aapka hemoglobin level, is report mein di gayi range ke andar hai."
                },
                "what_this_means": {
                    "en": "Based on the reference range on this report, your hemoglobin looks as expected. This suggests your red blood cells are likely carrying oxygen normally.",
                    "hi": "इस रिपोर्ट की reference range के हिसाब से, आपका hemoglobin सामान्य दिखता है। इससे पता चलता है कि आपके red blood cells संभवतः सामान्य रूप से oxygen ले जा रहे हैं।",
                    "hinglish": "Is report ki reference range ke hisaab se, aapka hemoglobin normal lagta hai. Isse pata chalta hai ki aapke red blood cells shayad normally oxygen le jaa rahe hain."
                }
            }
        },
        "White Blood Cells": {
            "full_name": {
                "en": "White Blood Cells (WBC)",
                "hi": "White Blood Cells (WBC)",
                "hinglish": "White Blood Cells (WBC)"
            },
            "what_is_this": {
                "en": "White blood cells are your body's defense team. They help your immune system fight off infections, viruses, and other threats. The WBC count tells us how many of these defense cells are circulating in your blood.",
                "hi": "White blood cells आपके शरीर की रक्षा टीम हैं। ये आपकी immune system को infections, viruses और अन्य खतरों से लड़ने में मदद करते हैं। WBC count बताता है कि आपके खून में कितने ऐसे रक्षक cells हैं।",
                "hinglish": "White blood cells aapke body ki defense team hain. Yeh aapki immune system ko infections, viruses aur doosri threats se ladne mein help karte hain. WBC count batata hai ki aapke blood mein kitne aise defense cells hain."
            },
            "below_range": {
                "what_did_report_show": {
                    "en": "Your white blood cell count is lower than the range shown on this report.",
                    "hi": "आपके white blood cells की संख्या, इस रिपोर्ट में दी गई सीमा से कम है।",
                    "hinglish": "Aapke white blood cells ki ginti, is report mein di gayi range se kam hai."
                },
                "what_this_means": {
                    "en": "A count below the reference range can sometimes indicate that the immune system is less active than usual. This can happen for various reasons including certain medications, viral infections, or other conditions. Your doctor will consider your full history and symptoms before drawing any conclusions.",
                    "hi": "Reference range से कम संख्या कभी-कभी यह दर्शा सकती है कि immune system सामान्य से कम सक्रिय है। यह कई कारणों से हो सकता है — जैसे कुछ दवाइयाँ, viral infections, या अन्य स्थितियाँ। आपके डॉक्टर कोई निष्कर्ष निकालने से पहले आपका पूरा इतिहास और लक्षण देखेंगे।",
                    "hinglish": "Reference range se kam ginti kabhi-kabhi yeh dikha sakti hai ki immune system thodi kam active hai. Yeh kai wajahon se ho sakta hai — jaise kuch medicines, viral infections, ya aur conditions. Aapke doctor koi conclusion nikalne se pehle aapki poori history aur symptoms dekhenge."
                },
                "should_i_worry": {
                    "en": "A lower white blood cell count does not always mean something is wrong. Many things, including certain medicines, can temporarily affect this number. Your doctor will advise you based on your complete picture.",
                    "hi": "WBC का कम होना हमेशा किसी समस्या का संकेत नहीं होता। कुछ दवाइयाँ भी इस संख्या को अस्थायी रूप से प्रभावित कर सकती हैं। आपके डॉक्टर आपकी पूरी स्थिति के आधार पर सलाह देंगे।",
                    "hinglish": "WBC ka low hona hamesha kisi problem ka sign nahi hota. Kuch medicines bhi is number ko temporarily affect kar sakti hain. Aapke doctor aapki poori situation ke hisaab se salah denge."
                },
                "doctor_questions": {
                    "en": "Why might my white blood cell count be lower than the range, and is this something to investigate further?",
                    "hi": "मेरे white blood cells की संख्या सीमा से कम क्यों हो सकती है, और क्या इसकी आगे जाँच होनी चाहिए?",
                    "hinglish": "Mere white blood cells ki ginti range se kam kyun ho sakti hai, aur kya ise aage investigate karna chahiye?"
                }
            },
            "above_range": {
                "what_did_report_show": {
                    "en": "Your white blood cell count is higher than the range shown on this report.",
                    "hi": "आपके white blood cells की संख्या, इस रिपोर्ट में दी गई सीमा से अधिक है।",
                    "hinglish": "Aapke white blood cells ki ginti, is report mein di gayi range se zyada hai."
                },
                "what_this_means": {
                    "en": "A higher white blood cell count can happen when your body is responding to something — like an infection, inflammation, stress, or other factors. This result alone does not tell us exactly what is causing it, and your doctor will look at the full picture.",
                    "hi": "White blood cells की अधिक संख्या तब हो सकती है जब शरीर किसी चीज़ पर प्रतिक्रिया दे रहा हो — जैसे infection, सूजन, तनाव, या अन्य कारण। केवल यह परिणाम सटीक कारण नहीं बताता और आपके डॉक्टर पूरी स्थिति देखेंगे।",
                    "hinglish": "WBC ki zyada ginti tab ho sakti hai jab body kisi cheez par react kar rahi ho — jaise infection, inflammation, stress, ya aur factors. Sirf yeh result exact wajah nahi batata aur aapke doctor poori picture dekhenge."
                },
                "should_i_worry": {
                    "en": "A higher-than-range white blood cell count does not automatically mean there is a serious infection or illness. Your doctor will look at this in context with how you feel and any other tests.",
                    "hi": "WBC का सीमा से अधिक होना अपने आप यह नहीं दर्शाता कि कोई गंभीर infection या बीमारी है। आपके डॉक्टर इसे आपकी तकलीफ और अन्य जाँचों के साथ देखेंगे।",
                    "hinglish": "WBC ka range se zyada hona apne aap yeh nahi batata ki koi serious infection ya bimari hai. Aapke doctor ise aapki taklif aur doosre tests ke saath dekhenge."
                },
                "doctor_questions": {
                    "en": "Why might my white blood cell count be higher than the range, and should any further tests be considered?",
                    "hi": "मेरे white blood cells की संख्या सीमा से अधिक क्यों हो सकती है, और क्या कोई और जाँच होनी चाहिए?",
                    "hinglish": "Mere white blood cells ki ginti range se zyada kyun ho sakti hai, aur kya koi aur test karna chahiye?"
                }
            },
            "within_range": {
                "what_did_report_show": {
                    "en": "Your white blood cell count is within the range shown on this report.",
                    "hi": "आपके white blood cells की संख्या, इस रिपोर्ट में दी गई सीमा के अंदर है।",
                    "hinglish": "Aapke white blood cells ki ginti, is report mein di gayi range ke andar hai."
                },
                "what_this_means": {
                    "en": "Based on the reference range on this report, your immune cell count looks as expected.",
                    "hi": "इस रिपोर्ट की reference range के अनुसार, आपके immune cells की संख्या सामान्य दिखती है।",
                    "hinglish": "Is report ki reference range ke hisaab se, aapke immune cells ki ginti normal lagti hai."
                }
            }
        },
        "Platelets": {
            "full_name": {
                "en": "Platelets (PLT)",
                "hi": "Platelets (PLT)",
                "hinglish": "Platelets (PLT)"
            },
            "what_is_this": {
                "en": "Platelets are tiny cells in your blood whose main job is to help stop bleeding. When you get a cut or injury, platelets rush to the site and clump together to form a clot. The platelet count tells us how many of these are in your blood.",
                "hi": "Platelets आपके खून में छोटी कोशिकाएँ हैं जिनका मुख्य काम रक्तस्राव रोकना है। जब आपको चोट लगती है, platelets उस जगह पर आ जाते हैं और एक साथ मिलकर थक्का बनाते हैं। Platelet count बताता है कि आपके खून में इनकी कितनी संख्या है।",
                "hinglish": "Platelets aapke blood mein choti cells hain jinaka main kaam bleeding rokna hai. Jab aapko chot lagti hai, platelets us jagah par aa jaate hain aur saath milkar clot banate hain. Platelet count batata hai ki aapke blood mein inki kitni ginti hai."
            },
            "below_range": {
                "what_did_report_show": {
                    "en": "Your platelet count is lower than the range shown on this report.",
                    "hi": "आपकी platelet संख्या, इस रिपोर्ट में दी गई सीमा से कम है।",
                    "hinglish": "Aapki platelet ginti, is report mein di gayi range se kam hai."
                },
                "what_this_means": {
                    "en": "A lower platelet count can happen for several reasons. In some cases it is mild and temporary. Your doctor will decide if any follow-up is needed based on your symptoms, medical history, and the degree of change.",
                    "hi": "Platelet संख्या का कम होना कई कारणों से हो सकता है। कुछ मामलों में यह मामूली और अस्थायी होता है। आपके डॉक्टर आपके लक्षणों, चिकित्सीय इतिहास और बदलाव की मात्रा के आधार पर तय करेंगे कि कोई आगे जाँच ज़रूरी है या नहीं।",
                    "hinglish": "Platelet ginti ka kam hona kai wajahon se ho sakta hai. Kuch cases mein yeh mild aur temporary hota hai. Aapke doctor aapke symptoms, medical history aur change ki degree ke hisaab se decide karenge ki koi follow-up zaroori hai ya nahi."
                },
                "should_i_worry": {
                    "en": "A lower platelet count needs to be understood in the context of your symptoms and overall health. Your doctor is the best person to guide you on this.",
                    "hi": "Platelet count का कम होना आपके लक्षणों और समग्र स्वास्थ्य के संदर्भ में समझा जाना ज़रूरी है। आपके डॉक्टर इस पर आपका सबसे अच्छा मार्गदर्शन कर सकते हैं।",
                    "hinglish": "Platelet count ka kam hona aapke symptoms aur overall health ke context mein samjha jaana zaroori hai. Aapke doctor is par aapko best guide kar sakte hain."
                },
                "doctor_questions": {
                    "en": "Why might my platelet count be lower than the range, and should I be concerned about bleeding or bruising?",
                    "hi": "मेरी platelet संख्या सीमा से कम क्यों हो सकती है, और क्या मुझे रक्तस्राव या नील पड़ने की चिंता करनी चाहिए?",
                    "hinglish": "Meri platelet ginti range se kam kyun ho sakti hai, aur kya mujhe bleeding ya bruising ki chinta karni chahiye?"
                }
            },
            "above_range": {
                "what_did_report_show": {
                    "en": "Your platelet count is higher than the range shown on this report.",
                    "hi": "आपकी platelet संख्या, इस रिपोर्ट में दी गई सीमा से अधिक है।",
                    "hinglish": "Aapki platelet ginti, is report mein di gayi range se zyada hai."
                },
                "what_this_means": {
                    "en": "A higher platelet count can occur for various reasons, including inflammation, recent infection, iron deficiency, or as a response to other conditions. Your doctor will interpret this alongside your other results.",
                    "hi": "Platelet संख्या का अधिक होना कई कारणों से हो सकता है — जैसे सूजन, हाल का infection, iron की कमी, या अन्य स्थितियों की प्रतिक्रिया। आपके डॉक्टर इसे बाकी परिणामों के साथ देखेंगे।",
                    "hinglish": "Platelet ginti ka zyada hona kai reasons se ho sakta hai — jaise inflammation, recent infection, iron deficiency, ya kisi aur condition ki wajah se. Aapke doctor ise baaki results ke saath dekhenge."
                },
                "should_i_worry": {
                    "en": "A higher platelet count does not always mean there is a clotting problem. Your doctor will assess whether any further investigation is needed.",
                    "hi": "Platelet count का अधिक होना हमेशा clotting की समस्या नहीं होती। आपके डॉक्टर आकलन करेंगे कि कोई आगे जाँच ज़रूरी है या नहीं।",
                    "hinglish": "Platelet count ka zyada hona hamesha clotting ki problem nahi hoti. Aapke doctor assess karenge ki koi further investigation zaroori hai ya nahi."
                },
                "doctor_questions": {
                    "en": "Why might my platelet count be higher than the range, and is any further investigation needed?",
                    "hi": "मेरी platelet संख्या सीमा से अधिक क्यों हो सकती है, और क्या कोई आगे जाँच ज़रूरी है?",
                    "hinglish": "Meri platelet ginti range se zyada kyun ho sakti hai, aur kya koi aage investigation zaroori hai?"
                }
            },
            "within_range": {
                "what_did_report_show": {
                    "en": "Your platelet count is within the range shown on this report.",
                    "hi": "आपकी platelet संख्या, इस रिपोर्ट में दी गई सीमा के अंदर है।",
                    "hinglish": "Aapki platelet ginti, is report mein di gayi range ke andar hai."
                },
                "what_this_means": {
                    "en": "Based on the reference range on this report, your platelet count is as expected.",
                    "hi": "इस रिपोर्ट की reference range के अनुसार, आपकी platelet संख्या सामान्य है।",
                    "hinglish": "Is report ki reference range ke hisaab se, aapki platelet ginti normal hai."
                }
            }
        }
    }

    def _get_param_key(self, name: str) -> str | None:
        """Match the parameter name to a known key."""
        name_lower = name.lower()
        if "hemoglobin" in name_lower or name_lower == "hb":
            return "Hemoglobin"
        if "white blood" in name_lower or "wbc" in name_lower or "leukocyte" in name_lower:
            return "White Blood Cells"
        if "platelet" in name_lower or "plt" in name_lower:
            return "Platelets"
        return None

    def _determine_status(self, name: str, value: float | None) -> str:
        """Determine range status based on extracted thresholds."""
        key = self._get_param_key(name)
        if value is None or key is None:
            return "unknown"
        if key == "Hemoglobin":
            if value < 12.0:
                return "below_range"
            if value > 15.5:
                return "above_range"
        elif key == "White Blood Cells":
            if value < 4.5:
                return "below_range"
            if value > 11.0:
                return "above_range"
        elif key == "Platelets":
            if value < 150:
                return "below_range"
            if value > 450:
                return "above_range"
        return "within_range"

    def _build_explanation(self, key: str, status: str) -> Dict[str, Any]:
        """
        Build a structured, patient-friendly explanation.
        Returns a dict of dicts — one per language — so the frontend can
        render each section (what_is_this, what_did_report_show, etc.) independently.
        """
        desc = self.PARAM_DESCRIPTIONS.get(key, {})
        langs = ["en", "hi", "hinglish"]
        result: Dict[str, Any] = {}

        if status in ("below_range", "above_range"):
            section = desc.get(status, {})
            for lang in langs:
                result[lang] = {
                    "what_is_this": desc.get("what_is_this", {}).get(lang, ""),
                    "what_did_report_show": section.get("what_did_report_show", {}).get(lang, ""),
                    "what_this_means": section.get("what_this_means", {}).get(lang, ""),
                    "should_i_worry": section.get("should_i_worry", {}).get(lang, "")
                }
        elif status == "within_range":
            section = desc.get("within_range", {})
            for lang in langs:
                result[lang] = {
                    "what_is_this": desc.get("what_is_this", {}).get(lang, ""),
                    "what_did_report_show": section.get("what_did_report_show", {}).get(lang, ""),
                    "what_this_means": section.get("what_this_means", {}).get(lang, ""),
                    "should_i_worry": None
                }
        else:
            for lang in langs:
                result[lang] = {
                    "what_is_this": "",
                    "what_did_report_show": "",
                    "what_this_means": "",
                    "should_i_worry": None
                }

        return result

    def _build_doctor_question(self, key: str, status: str) -> Dict[str, str]:
        desc = self.PARAM_DESCRIPTIONS.get(key, {})
        if status in ("below_range", "above_range"):
            q = desc.get(status, {}).get("doctor_questions", {})
            return {lang: q.get(lang, "") for lang in ["en", "hi", "hinglish"]}
        return {"en": "", "hi": "", "hinglish": ""}

    def analyze(self, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        patient = structured_data.get("patient", {})
        report_meta = structured_data.get("report", {"type": "cbc", "title": "Complete Blood Count"})
        input_params = structured_data.get("parameters", [])

        if not input_params:
            return {
                "patient": patient,
                "report": report_meta,
                "summary": {
                    "overview": {
                        "en": "We were not able to read the test values from your report clearly. Please make sure the file contains readable text.",
                        "hi": "हम आपकी रिपोर्ट से test के मान स्पष्ट रूप से नहीं पढ़ सके। कृपया सुनिश्चित करें कि फाइल में पठनीय text हो।",
                        "hinglish": "Hum aapki report se test values clearly nahi padh sake. Kripya ensure karein ki file mein readable text ho."
                    },
                    "within_range": 0, "above_range": 0, "below_range": 0, "unknown": 0,
                    "attention_summary": []
                },
                "parameters": [],
                "attention_items": [],
                "doctor_questions": {"en": [], "hi": [], "hinglish": []},
                "limitations": self._limitations()
            }

        output_params = []
        attention_items = []
        attention_summary = []
        doc_q: Dict[str, list] = {"en": [], "hi": [], "hinglish": []}
        counts = {"within_range": 0, "above_range": 0, "below_range": 0, "unknown": 0}

        for param in input_params:
            name = param.get("name", "")
            value = param.get("value")
            confidence = param.get("confidence")  # pass through from processor
            key = self._get_param_key(name)
            status = self._determine_status(name, value)
            counts[status] += 1

            # Full name with abbreviation
            if key and key in self.PARAM_DESCRIPTIONS:
                full_name = self.PARAM_DESCRIPTIONS[key]["full_name"]["en"]
                explanation = self._build_explanation(key, status)
                q = self._build_doctor_question(key, status)
                for lang in ["en", "hi", "hinglish"]:
                    if q.get(lang):
                        doc_q[lang].append(q[lang])
            else:
                full_name = name
                explanation = self._build_explanation("", status)

            if status in ("above_range", "below_range"):
                attention_items.append(name)
                attention_summary.append({
                    "name": full_name,
                    "status": status,
                    "value": value,
                    "unit": param.get("unit", ""),
                    "reference_range": param.get("reference_range", "")
                })

            output_params.append({
                "name": full_name,
                "value": value,
                "unit": param.get("unit", ""),
                "reference_range": param.get("reference_range", ""),
                "status": status,
                "explanation": explanation,
                "confidence": confidence
            })

        # Build natural-language summary based on counts
        total = sum(counts.values())
        below = counts["below_range"]
        above = counts["above_range"]
        outside = below + above

        if outside == 0:
            overview = {
                "en": f"All {total} result{'s' if total != 1 else ''} checked in this report are within the ranges shown. That is a good sign, though it is still worth discussing your report with your doctor at your next visit.",
                "hi": f"इस रिपोर्ट में जाँचे गए सभी {total} परिणाम, दी गई सीमाओं के अंदर हैं। यह एक अच्छा संकेत है, हालाँकि फिर भी अगली बार डॉक्टर से रिपोर्ट के बारे में बात करना उचित है।",
                "hinglish": f"Is report mein check kiye gaye saare {total} results, di gayi ranges ke andar hain. Yeh ek achha sign hai, lekin phir bhi doctor se report ke baare mein baat karna accha rahega."
            }
        elif outside == total:
            overview = {
                "en": f"All {total} result{'s' if total != 1 else ''} in this report are outside the ranges shown. This means your doctor will want to look at these carefully together with how you feel and your medical history.",
                "hi": f"इस रिपोर्ट के सभी {total} परिणाम दी गई सीमाओं से बाहर हैं। इसका मतलब है कि आपके डॉक्टर इन्हें आपके लक्षणों और चिकित्सा इतिहास के साथ ध्यान से देखेंगे।",
                "hinglish": f"Is report ke saare {total} results di gayi ranges se bahar hain. Iska matlab hai aapke doctor inhe aapke symptoms aur medical history ke saath dhyan se dekhenge."
            }
        else:
            within = counts["within_range"]
            overview = {
                "en": f"Out of {total} result{'s' if total != 1 else ''} checked, {within} {'are' if within != 1 else 'is'} within the range shown on your report and {outside} {'are' if outside != 1 else 'is'} outside that range. The result{'s' if outside != 1 else ''} outside the range {'are' if outside != 1 else 'is'} worth discussing with your doctor, especially if you have related symptoms.",
                "hi": f"जाँचे गए {total} परिणामों में से, {within} रिपोर्ट की सीमा के अंदर {'हैं' if within != 1 else 'है'} और {outside} उस सीमा से बाहर {'हैं' if outside != 1 else 'है'}। सीमा से बाहर के परिणाम डॉक्टर से चर्चा करने लायक हैं, खासकर अगर आपको संबंधित लक्षण हों।",
                "hinglish": f"Check kiye gaye {total} results mein se, {within} report ki range ke andar {'hain' if within != 1 else 'hai'} aur {outside} us range se bahar {'hain' if outside != 1 else 'hai'}. Range se bahar ke results doctor se discuss karne layak hain, khaaskar agar aapko related symptoms hon."
            }

        # Add generic follow-up questions if no parameter-specific ones
        for lang in ["en", "hi", "hinglish"]:
            if lang == "en":
                doc_q[lang].append("Could any medication, recent illness, or lifestyle factor be affecting my results?")
                doc_q[lang].append("When should I have my next routine blood test?")
            elif lang == "hi":
                doc_q[lang].append("क्या कोई दवा, हाल की बीमारी, या जीवनशैली का कारण मेरे परिणामों को प्रभावित कर सकता है?")
                doc_q[lang].append("मुझे अगला routine blood test कब करवाना चाहिए?")
            else:
                doc_q[lang].append("Kya koi medicine, recent illness, ya lifestyle factor mere results ko affect kar sakta hai?")
                doc_q[lang].append("Mujhe agla routine blood test kab karwana chahiye?")

        return {
            "patient": patient,
            "report": report_meta,
            "summary": {
                "overview": overview,
                "within_range": counts["within_range"],
                "above_range": counts["above_range"],
                "below_range": counts["below_range"],
                "unknown": counts["unknown"],
                "attention_summary": attention_summary
            },
            "parameters": output_params,
            "attention_items": attention_items,
            "doctor_questions": doc_q,
            "limitations": self._limitations()
        }

    def _limitations(self) -> list:
        return [
            "CareAI provides informational explanations only. It does not replace the advice of a qualified doctor or other healthcare professional.",
            "Reference ranges can vary between laboratories. The same result may mean different things in different contexts.",
            "A single blood test cannot give a complete picture. Your doctor will look at your results together with your symptoms and medical history.",
            "If you have any concerns about your health, please consult your doctor promptly."
        ]
