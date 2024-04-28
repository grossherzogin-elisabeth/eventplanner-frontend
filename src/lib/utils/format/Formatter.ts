export class Formatter {
    public static formatDate(date?: Date | string | number): string {
        if (!date) {
            return '';
        }
        const d = new Date(date);
        const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate().toString();
        const month = d.getMonth() < 9 ? `0${d.getMonth() + 1}` : (d.getMonth() + 1).toString();
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }

    public static formatCurrency(value: number, currency: string = '€'): string {
        let formattedValue = '';
        const fulls = Math.floor(value);
        const cents = Math.floor((value - fulls) * 100);
        if (cents === 0) {
            formattedValue = `${fulls},00`;
        } else if (cents < 10) {
            formattedValue = `${fulls},0${cents}`;
        } else {
            formattedValue = `${fulls},${cents}`;
        }

        switch (currency) {
            case '$':
                return `$${formattedValue}`;
            case '€':
                return `${formattedValue}€`;
            default:
                return formattedValue + currency;
        }
    }
}
