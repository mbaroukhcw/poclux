export interface TranslatedModel {
  translations?: Record<string, Record<string, string>>;
}

export const modelToDTOFactory =
  <T extends Array<string>>(fieldnames: T) =>
  (
    from: TranslatedModel & Record<string, any>,
    locale: string
  ): Omit<typeof from, "translations"> => {
    const { translations, ...rest } = from;

    if (locale !== "default") {
      for (const f of fieldnames) {
        const t = translations?.[locale]?.[f];
        if (t) {
          rest[f] = t;
        }
      }
    }

    return rest;
  };

export const dtoToModelFactory =
  <T extends Array<string>>(fieldnames: T) =>
  (
    dto: any,
    model: TranslatedModel & Record<string, any>,
    locale: string
  ): typeof model => {
    const translations = model.translations ?? {};
    const t = translations?.[locale] ?? {};
    for (const f of fieldnames) {
      if (dto[f]) {
        if (locale !== "default") {
          t[f] = dto[f];
        } else {
          model[f] = dto[f];
        }
      }
    }
    if (locale !== "default") {
      translations[locale] = t;
    }
    model.translations = translations;

    return model;
  };
