import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn("Supabase env vars missing, returning mock data");
            return NextResponse.json([
                {
                    id: 1,
                    chain_name: 'Monad Testnet',
                    asset_symbol: 'MON',
                    tvl: '1240200',
                    apy: '12.4',
                    pool_type: 'MASTER',
                    contract_address: '0x1234...5678',
                    is_live: true
                },
                {
                    id: 2,
                    chain_name: 'Avalanche Fuji',
                    asset_symbol: 'AVAX',
                    tvl: '850000',
                    apy: '8.2',
                    pool_type: 'SATELLITE',
                    contract_address: '0xabcd...efgh',
                    is_live: true
                }
            ]);
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data: pools, error } = await supabase
            .from('pools')
            .select('*')
            .order('pool_type', { ascending: false })

        if (error) throw error

        const result = (pools || []).map(pool => ({
            ...pool,
            is_live: !!pool.contract_address && !pool.contract_address.startsWith('0x0000')
        }));

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Pools API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
