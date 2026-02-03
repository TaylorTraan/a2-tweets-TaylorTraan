class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const lower = this.text.toLowerCase();
        if (lower.includes('watch my')) return 'live_event';
        if (lower.includes('achieved')) return 'achievement';
        if (lower.includes('just completed') || lower.includes('just posted')) return 'completed_event';
        return 'miscellaneous';
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        if (this.source !== 'completed_event') return false;
        const userPart = this.getStrippedUserPart();
        if (userPart === '') return false;
        const lower = userPart.toLowerCase();
        const defaults = ['tomtom mysports watch', 'new pb on this route', 'fat burner (level 9)', 'treadmill walking', 'treadmill', 'mysports freestyle'];
        return !defaults.some(d => lower === d || lower.startsWith(d + ' ') || lower.endsWith(' ' + d));
    }

    get writtenText():string {
        if (!this.written) return "";
        return this.getStrippedUserPart().trim();
    }

    private getStrippedUserPart(): string {
        let t = this.text
            .replace(/#Runkeeper|#RKLive|#FitnessAlerts/gi, '')
            .replace(/https:\/\/t\.co\/\S+/g, '')
            .replace(/\s*with @Runkeeper\. Check it out!\s*/gi, '')
            .trim();
        const dashIndex = t.indexOf(' - ');
        if (dashIndex === -1) return '';
        return t.substring(dashIndex + 3).trim();
    }

    get activityType():string {
        if (this.source !== 'completed_event') return 'unknown';
        const t = this.text;
        const kmIdx = t.indexOf(' km ');
        const miIdx = t.indexOf(' mi ');
        let unitEnd = -1;
        if (kmIdx >= 0 && (miIdx < 0 || kmIdx <= miIdx)) {
            unitEnd = kmIdx + 4;
        } else if (miIdx >= 0) {
            unitEnd = miIdx + 4;
        }
        if (unitEnd < 0) return '';
        const withIdx = t.indexOf(' with', unitEnd);
        const dashIdx = t.indexOf(' - ', unitEnd);
        let endIdx = t.length;
        if (withIdx >= 0 && withIdx < endIdx) endIdx = withIdx;
        if (dashIdx >= 0 && dashIdx < endIdx) endIdx = dashIdx;
        return t.substring(unitEnd, endIdx).trim().toLowerCase();
    }

    get distance():number {
        if (this.source !== 'completed_event') return 0;
        const t = this.text;
        const kmIdx = t.indexOf(' km ');
        const miIdx = t.indexOf(' mi ');
        let unitIdx = -1;
        let isKm = false;
        if (kmIdx >= 0 && (miIdx < 0 || kmIdx <= miIdx)) {
            unitIdx = kmIdx;
            isKm = true;
        } else if (miIdx >= 0) {
            unitIdx = miIdx;
        }
        if (unitIdx <= 0) return 0;
        let numEnd = unitIdx;
        let numStart = numEnd - 1;
        while (numStart >= 0 && (t[numStart] >= '0' && t[numStart] <= '9' || t[numStart] === '.')) {
            numStart--;
        }
        numStart++;
        const numStr = t.substring(numStart, numEnd);
        const val = parseFloat(numStr);
        if (isNaN(val)) return 0;
        if (isKm) return val / 1.609;
        return val;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}