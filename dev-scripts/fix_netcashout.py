with open('/Users/erikbailey/Documents/travel-tool/src/components/ExpensesTab.js', 'r') as f:
    c = f.read()

old = '''                  <input type="number" value={payment.netCashOut}
                    onChange={e => {
                      const val = e.target.value;
                      const calc = totalValue > 0 ? parseFloat(Math.max(0, totalValue - (parseFloat(payment.pointsValue) || 0)).toFixed(2)) : 0;
                      const net = val === '' ? calc : val;
                      onChange(index, { ...payment, netCashOut: net, localNetCashOut: '' });
                    }}
                    placeholder="0"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc', MozAppearance: 'textfield' }} />'''

new = '''                  <input type="text" inputMode="decimal" value={payment.netCashOut}
                    onChange={e => {
                      const val = e.target.value;
                      onChange(index, { ...payment, netCashOut: val, localNetCashOut: '' });
                    }}
                    onBlur={e => {
                      const val = e.target.value;
                      const calc = totalValue > 0 ? parseFloat(Math.max(0, totalValue - (parseFloat(payment.pointsValue) || 0)).toFixed(2)) : 0;
                      const net = val === '' || val === '.' ? calc : parseFloat(val) || calc;
                      onChange(index, { ...payment, netCashOut: net, localNetCashOut: '' });
                    }}
                    placeholder="0"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }} />'''

count = c.count(old)
print(f'Found: {count}x')
c = c.replace(old, new)

with open('/Users/erikbailey/Documents/travel-tool/src/components/ExpensesTab.js', 'w') as f:
    f.write(c)
print('Done')
