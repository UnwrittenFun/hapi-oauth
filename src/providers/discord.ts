import fetch from 'node-fetch';
import { stringify } from 'querystring';

import { Provider, Scopes, AccessTokens } from '../provider';
import { Profile } from '../profile';
import { name, version } from '../info';

export class DiscordProfile implements Profile {
    public id: string;
    public username: string;
    public discriminator: string;
    public avatar: string;
    public bot: boolean;
    public mfa_enabled: boolean;
    public verified: boolean;
    public email: string;

    constructor(profile: any) {
        Object.assign(this, profile);
    }

    public getUniqueId() {
        return this.id;
    }
}

export class DiscordProvider extends Provider {
    public name = 'discord';
    public tokenUrl = 'https://discordapp.com/api/oauth2/token';
    public authUrl = 'https://discordapp.com/api/oauth2/authorize';
    public profileUrl = 'https://discordapp.com/api/users/@me';

    constructor(
        public clientId: string,
        public clientSecret: string,
        public scopes: Scopes = [],
    ) {
        super();
    }

    public requestToken(code: string, redirect_uri: string) {
        return fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Accept-Encoding': 'gzip,deflate',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: stringify({
                code,
                redirect_uri,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
            }),
            compress: true,
        })
            .then(res => res.json())
            .then(token => token);
    }

    public getProfile(tokens: AccessTokens): Promise<DiscordProfile> {
        return fetch(this.profileUrl, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                'Accept-Encoding': 'gzip,deflate',
                'User-Agent': `${name} (https://github.com/UnwrittenFun/hapi-oauth, ${version})`,
            },
            compress: true,
        })
            .then(res => res.json())
            .then(profile => new DiscordProfile(profile));
    }
}
