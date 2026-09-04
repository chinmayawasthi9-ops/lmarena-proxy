import re

with open('run_github_runner.py') as f:
    code = f.read()

v0 = re.search(r'\"name\": \"arena-auth-prod-v1.0\",\s*\"value\": \"([^\"]+)\"', code).group(1)
v1 = re.search(r'\"name\": \"arena-auth-prod-v1.1\",\s*\"value\": \"([^\"]+)\"', code).group(1)
bm = re.search(r'\"name\": \"__cf_bm\",\s*\"value\": \"([^\"]+)\"', code).group(1)
visit_id = re.search(r'\"name\": \"arena_visit_id\",\s*\"value\": \"([^\"]+)\"', code).group(1)

with open('worker.js') as f:
    wcode = f.read()

# Clean any previous /direct-test
if '/direct-test' in wcode:
    start_pos = wcode.find('if (url.pathname === "/direct-test")')
    end_pos = wcode.find('if (url.pathname === "/test")')
    wcode = wcode[:start_pos] + wcode[end_pos:]

test_endpoint = '''    if (url.pathname === "/direct-test") {
      const v0 = ''' + repr(v0) + ''';
      const v1 = ''' + repr(v1) + ''';
      const bm = ''' + repr(bm) + ''';
      const visitId = ''' + repr(visit_id) + ''';
      const cookieHdr = `arena-auth-prod-v1.0=${v0}; arena-auth-prod-v1.1=${v1}; __cf_bm=${bm}; arena_visit_id=${visitId}; user_country_code=IN`;
      
      const payload = {
        id: generateUUIDv7(),
        mode: "direct-battle",
        modelAId: "01a05e31-fc9d-76dc-b6bf-ab5b6781d4c3",
        userMessageId: generateUUIDv7(),
        modelAMessageId: generateUUIDv7(),
        userMessage: { content: "Say hi in 3 words", experimental_attachments: [] },
        modality: "chat"
      };

      try {
        const resp = await fetch("https://arena.ai/nextjs-api/stream/create-evaluation", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            "Accept": "*/*",
            "Origin": "https://arena.ai",
            "Referer": "https://arena.ai/text/direct-battle",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Cookie": cookieHdr
          },
          body: JSON.stringify(payload)
        });
        const text = await resp.text();
        return new Response(`Worker Direct Status: ${resp.status}\\nBody: ${text.slice(0, 300)}`);
      } catch (err) {
        return new Response(`Worker Direct Error: ${err.message}`, { status: 500 });
      }
    }
'''

marker = 'if (url.pathname === "/test") {'
wcode = wcode.replace(marker, test_endpoint + '\n    ' + marker)

with open('worker.js', 'w') as f:
    f.write(wcode)

print('Cleanly inserted /direct-test!')
