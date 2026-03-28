export const pl = {
  // --- Common ---
  save: "Zapisz",
  cancel: "Anuluj",
  delete: "Usuń",
  edit: "Edytuj",
  close: "Zamknij",
  back: "Wróć",
  retry: "Spróbuj ponownie",
  active: "Aktywny",
  inactive: "Nieaktywny",
  confirm: "Potwierdź",

  // --- Dashboard ---
  dashboard: "Dashboard",
  dashboardSubtitle: "Organizuj miesiąc i twórz lekcje we współpracy z AI.",
  assistantTip: "Wskazówka AI",
  assistantTipBody:
    'Większość dzieci jest teraz zaciekawiona tematem "Jesienne Liście" – dodaj to jako temat dnia!',
  pendingTasks: "Zadania do wykonania",
  noTasks: "Brak zadań – wszystko gotowe!",
  urgent: "Pilne",

  // --- Profiles ---
  careManagement: "Zarządzanie opieką",
  specialRequirements: "Specjalne wymagania",
  gdprBanner:
    "Widok filtrowany dla specjalistycznej opieki. Dane są szyfrowane i zgodne z lokalnymi przepisami o ochronie prywatności (RODO).",
  addChildProfile: "Dodaj profil dziecka",
  editChildProfile: "Edytuj profil dziecka",
  childName: "Imię dziecka",
  conditionDescription: "Opis specjalnych potrzeb",
  conditionDescriptionHint:
    "Opisz potrzeby dziecka własnymi słowami. Tekst zostanie zanonimizowany przed wysłaniem do AI.",
  conditionDescriptionPlaceholder:
    "np. Porusza się na wózku, potrzebuje dostępu przez rampę i więcej czasu na przejścia",
  childNamePlaceholder: "np. Leo",
  conditionDescriptionRequired: "Opisz specjalne potrzeby dziecka.",
  nameRequired: "Imię jest wymagane.",
  saveProfile: "Zapisz profil",
  saveChanges: "Zapisz zmiany",
  deleteProfile: "Usuń profil",
  deleteProfileConfirm: "Usunąć %name%? Tej operacji nie można cofnąć.",

  // --- Day Plan ---
  planHeader: "Plan dnia",
  createLesson: "Tworzenie lekcji",
  noPlan: "Brak planu na ten dzień",
  dayTopic: "Temat dnia",
  topicPlaceholder: "Wpisz temat (opcjonalnie)",
  generatePlan: "Generuj Plan Lekcji",
  aiConsiders: "Co weźmie pod uwagę AI",
  season: "Pora roku",
  upcoming: "Zbliżające się",
  noSpecialProfiles: "Brak profili specjalnych",
  tipTitle: "Wskazówka",
  tipBody:
    "Podanie konkretnych materiałów klasowych pomaga AI tworzyć bardziej trafne aktywności.",
  generating: "Generowanie planu...",
  planError: "Błąd generowania",
  share: "Udostępnij",
  regenerate: "Generuj ponownie",
  regenerateTitle: "Wygenerować nowy plan?",
  regenerateBody:
    "Aktualny plan zostanie zastąpiony. Tej operacji nie można cofnąć.",
  deletePlan: "Usuń plan",
  deletePlanConfirm: "Usunąć plan na ten dzień? Tej operacji nie można cofnąć.",
  pedagogicalGoals: "Cele pedagogiczne",
  curriculumPoints: "Podstawa programowa",
  adaptations: "Dostosowania",

  // --- Settings ---
  settings: "Ustawienia",
  appInfo: "Informacje o aplikacji",
  language: "Język",
  languageLabel: "Wybierz język aplikacji",
  aiStatus: "AI Gemini",
  aiActive: "Aktywny",
  aiStatusBody:
    "Plany lekcji są generowane przez Google Gemini 2.0 Flash. Model odpowiada w ciągu kilku sekund.",
  privacyNote:
    "Imiona dzieci nigdy nie są wysyłane do chmury. Przed każdym wywołaniem AI dane są anonimizowane na urządzeniu.",

  // --- Seasons ---
  seasonSpring: "Wiosna",
  seasonSummer: "Lato",
  seasonAutumn: "Jesień",
  seasonWinter: "Zima",

  // --- Day plan extras ---
  activeProfiles: (n: number) =>
    `${n} aktywn${n === 1 ? "y" : "ych"} profil${n === 1 ? "" : "i"} specjalnych`,
  downloadingModel: "Pobieranie modelu AI na urządzenie",
  generatingPlan: "AI tworzy plan lekcji…",
  shareLabel: "Udostępnij",
  apiKeyMissing:
    "Klucz API nie jest skonfigurowany. Skontaktuj się z administratorem.",

  // --- AI prompt language instruction ---
  aiLanguageInstruction: "Odpowiadaj wyłącznie po polsku.",
};

export type Translations = typeof pl;
