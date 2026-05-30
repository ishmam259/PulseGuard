const strings = {
    'en': {
        'AI_SYMPTOM_CHECKER': 'AI Symptom Checker'   
    },
    'bn': {
        'AI_SYMPTOM_CHECKER': 'এআই সিম্পটম চেকার'
    }
}

const $ = (item, locale='en') => {
    return strings[locale][item];
}

export default $;