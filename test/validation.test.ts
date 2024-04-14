import { RefinementCtx, ZodError, z } from "zod";

describe('Zod', () => {
    it('should support validation', () => {
        const schema = z.string().min(3).max(100);

        const request = 'Ricid';
        const result = schema.parse(request);

        expect(result).toBe('Ricid');
    });

    it('should support primive data type', () => {
        const usernameSchema = z.string().email();
        const isAdminSchema = z.boolean();
        const priceSchema = z.number().min(100).max(1000000);

        const username = usernameSchema.parse('ricidkumbara@gmail.com');
        console.log(username);
        
        const isAdmin = isAdminSchema.parse(true);
        console.log(isAdmin);

        const price = priceSchema.parse(10000);
        console.log(price);
    });

    it('should support data conversion', () => {
        const usernameSchema = z.coerce.string().min(3).max(100);
        const isAdminSchema = z.coerce.boolean();
        const priceSchema = z.coerce.number().min(100).max(1000000);

        const username = usernameSchema.parse(12345);
        console.log(username);
        
        const isAdmin = isAdminSchema.parse(1);
        console.log(isAdmin);

        const price = priceSchema.parse('10000');
        console.log(price);
    });

    it('should support date validation', () => {
        const birthDateSchema = z.coerce.date().min(new Date(1980, 0, 1)).max(new Date(2020, 0, 1));

        const birthDate = birthDateSchema.parse('1998-01-01');
        console.log(birthDate);
        
        const birthDate2 = birthDateSchema.parse(new Date(1998, 0, 1));
        console.log(birthDate2);
    });

    it('should return zod error if invalid with exception', () => {
        const schema = z.string().min(10).email();
        
        try {
            const result = schema.parse('ricid');
            console.log(result);
        } catch (e) {
            if (e instanceof ZodError) {
                console.log(e.errors);
            }
        }
    });

    it('should return zod error if invalid without exception', () => {
        const schema = z.string().min(10).email();
        const result = schema.safeParse('ricid@gmail.com');
        
        if (result.success) {
            console.log(result.data);
        } else {
            console.log(result.error);
        }
    });

    it('should can validate object', () => {
        const loginSchema = z.object({
           username: z.string().email(), 
           password: z.string().min(6), 
        });

        const request = {
            username: 'ricidkumbara@gmail.com',
            password: '123456',
            ignore: 'ignore',
        };

        const result = loginSchema.parse(request);
        console.log(result);
    });

    it('should can validate nested object', () => {
        const createUserSchema = z.object({
            id: z.string().max(100),
            name: z.string().max(100),
            address: z.object({
                street: z.string().max(100),
                city: z.string().max(100),
                zip: z.string().max(100),
                country: z.string().max(100),
            }),
        });

        const request = {
            id: '123',
            name: 'Ricid Kumbara',
            address: {
                street: 'JL',
                city: 'PWK',
                zip: '41181',
                country: 'ID',
            }
        };

        const result = createUserSchema.parse(request);
        console.log(result);
    });

    it('should can validate array', () => {
        const schema = z.array(z.string().email().min(1).max(40));
        const request: Array<string> = ['ricidkumbara@gmail.com', 'ricid.common@gmail.com'];
        const result: Array<string> = schema.parse(request);

        console.log(result);
    });

    it('should can validate set', () => {
        const schema = z.set(z.string().email().min(1).max(40));
        const request: Set<string> = new Set(['ricidkumbara@gmail.com', 'ricid.common@gmail.com', 'ricid.common@gmail.com']);
        const result: Set<string> = schema.parse(request);

        console.log(result);
    });

    it('should can validate map', () => {
        const schema = z.map(z.string(), z.string().email());
        const request: Map<string, string> = new Map([
            ['ricid', 'ricid@gmail.com'],
            ['kumbara', 'kumbara@gmail.com'],
        ]);
        const result: Map<string, string> = schema.parse(request);

        console.log(result);
    });

    it('should can validate object with message', () => {
        const loginSchema = z.object({
           username: z.string().email('Username harus email'), 
           password: z.string().min(6, 'password min harus 6 karakter'), 
        });

        const request = {
            username: 'ricidkumbara_gmail.com',
            password: '123456',
            ignore: 'ignore',
        };

        try {
            const result = loginSchema.parse(request);
            console.log(result);
        } catch (e) {
            console.log(e);
        }
    });

    it('should can support optional validtion', () => {
        const registerSchema = z.object({
            username: z.string().email(),
            password: z.string().min(5).max(100),
            firstName: z.string().min(5).max(100),
            lastName: z.string().min(5).max(100).optional(),
        });

        const request = {
            username: 'ricidkumbara@gmail.com',
            password: 'kosongin',
            firstName: 'Ricid',
        };

        const result = registerSchema.parse(request);
        console.log(result);
    });

    it('should support transform', () => {
        const schema = z.string().transform((data) => {
            return data.toLocaleUpperCase();
        });

        const result = schema.parse('ricid');
        console.log(result);
    });

    function mustUpperCase(data: string, ctx: RefinementCtx): string {
        if (data != data.toUpperCase()) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               message: 'Username harus uppercase' 
            });

            return z.NEVER;
        } else {
            return data;
        }
    }

    it('should can use custom validation', () => {
        const loginSchema = z.object({
            username: z.string().email().transform(mustUpperCase),
            password: z.string().min(6)
        });

        const request = {
            username: 'RICIDKUMBARA@GMAIL.COM',
            password: 'kosongin'
        };

        const result = loginSchema.parse(request);

        console.log(result); 
    });
});