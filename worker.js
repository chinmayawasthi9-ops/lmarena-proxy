/**
 * LMArena Cloudflare Worker Gateway
 * Acts as a serverless coordinator bridging OpenAI API requests and the LMArena browser injector.
 */

const DEFAULT_MODELS = {
  "KAT-Coder-Pro-V1": { id: "019c030b-d0ae-7849-9fa4-8730f05aaaa3", type: "chat" },
  "KAT-Coder-Pro-V1-unlimited-20260127": { id: "019c030b-d0ae-7849-9fa4-8730f05aaaa3", type: "chat" },
  "Max": { id: "019b24bb-5caf-71c3-b854-37d0c7086f21", type: "chat" },
  "ajax-20260517": { id: "019e37c2-46ec-735c-bf5b-63f1c00ec573", type: "chat" },
  "amazon.nova-pro-v1:0": { id: "a14546b5-d78d-4cf6-bb61-ab5b8510a9d6", type: "chat" },
  "anonymous-0825": { id: "01a03a3b-64e3-790c-bdba-bd0e1c04b0f5", type: "chat" },
  "august26-chatbot1": { id: "019fde64-4042-75ce-955d-90f16327afe2", type: "chat" },
  "august26-chatbot1-fmme": { id: "019fde64-4042-75ce-955d-90f16327afe2", type: "chat" },
  "auto-bear-v2": { id: "019e7565-e0cc-7f7e-ab49-a9352e70f2b4", type: "chat" },
  "auto-bear-v2-ej1q": { id: "019e7565-e0cc-7f7e-ab49-a9352e70f2b4", type: "chat" },
  "autumn-byteplus": { id: "019b3943-7503-776f-9632-c3c5da0c39b7", type: "chat" },
  "boss-bandit": { id: "019b24bb-5caf-71c3-b854-37d0c7086f21", type: "chat" },
  "chatgpt-image-latest-high-fidelity (20251216)": { id: "019be242-8366-7a60-a378-160b233d1f76", type: "chat" },
  "chatgpt-image-latest-high-fidelity-20251216": { id: "019be242-8366-7a60-a378-160b233d1f76", type: "chat" },
  "claude-fable-5": { id: "019f1e36-c859-7969-a594-ec6a4f7b3867", type: "chat" },
  "claude-fable-5-search": { id: "019f1e98-ccba-72c4-8841-c1cf48dc78f4", type: "chat" },
  "claude-fable-5-search-v2": { id: "019f1e98-ccba-72c4-8841-c1cf48dc78f4", type: "chat" },
  "claude-fable-5-v2": { id: "019f1e36-c859-7969-a594-ec6a4f7b3867", type: "chat" },
  "claude-fable-5.1-high": { id: "01a05e31-fc9d-76dc-b6bf-ab5b6781d4c3", type: "chat" },
  "claude-fable-5.1-low": { id: "01a05e32-019a-7559-921b-6bb29a23a8ad", type: "chat" },
  "claude-fable-5.1-max": { id: "01a05e32-12b8-73b3-9d7f-5b5cef1953cd", type: "chat" },
  "claude-fable-5.1-search": { id: "01a05eb2-be87-7852-af01-0828c3755ef4", type: "chat" },
  "claude-haiku-4-5-20251001": { id: "0199e8e9-01ed-73e0-96ba-cf43b286bf10", type: "chat" },
  "claude-opus-4-1-20250805": { id: "96ae95fd-b70d-49c3-91cc-b58c7da1090b", type: "chat" },
  "claude-opus-4-1-20250805-thinking-16k": { id: "f1a2eb6f-fc30-4806-9e00-1efd0d73cbc4", type: "chat" },
  "claude-opus-4-1-search": { id: "d942b564-191c-41c5-ae22-400a930a2cfe", type: "chat" },
  "claude-opus-4-20250514": { id: "ee116d12-64d6-48a8-88e5-b2d06325cdd2", type: "chat" },
  "claude-opus-4-20250514-thinking-16k": { id: "3b5e9593-3dc0-4492-a3da-19784c4bde75", type: "chat" },
  "claude-opus-4-5-20251101": { id: "019adbec-8396-71cc-87d5-b47f8431a6a6", type: "chat" },
  "claude-opus-4-5-20251101-thinking-32k": { id: "019ab8b2-9bcf-79b5-9fb5-149a7c67b7c0", type: "chat" },
  "claude-opus-4-5-20251101-vertex": { id: "019adbec-8396-71cc-87d5-b47f8431a6a6", type: "chat" },
  "claude-opus-4-5-search": { id: "019bda1f-2da5-7e9b-b357-2ed018d39393", type: "chat" },
  "claude-opus-4-6": { id: "019c2fac-13de-7550-a751-f5f593c77c72", type: "chat" },
  "claude-opus-4-6-search": { id: "019c6f55-308b-71ac-95af-f023a48253cf", type: "chat" },
  "claude-opus-4-6-thinking": { id: "019c2f86-74db-7cc3-baa5-6891bebb5999", type: "chat" },
  "claude-opus-4-6-vertex": { id: "019c2fac-13de-7550-a751-f5f593c77c72", type: "chat" },
  "claude-opus-4-7": { id: "019d9806-5d91-76b3-b353-826cb3193b43", type: "chat" },
  "claude-opus-4-7-search": { id: "019dc1ff-c88d-7106-bba7-b2358c26c590", type: "chat" },
  "claude-opus-4-7-thinking": { id: "019d9808-2b2f-7272-b7ea-0634461e5316", type: "chat" },
  "claude-opus-4-7-vertex": { id: "019d9806-5d91-76b3-b353-826cb3193b43", type: "chat" },
  "claude-opus-4-8": { id: "019e6f8f-853d-79fd-8776-beb4ec4752aa", type: "chat" },
  "claude-opus-4-8-search": { id: "019e716b-0c56-71f1-b744-866b07e73040", type: "chat" },
  "claude-opus-4-8-thinking": { id: "019e6f94-9377-7adb-828a-702fef8ab254", type: "chat" },
  "claude-opus-4-8-vertex": { id: "019e6f8f-853d-79fd-8776-beb4ec4752aa", type: "chat" },
  "claude-opus-4-search": { id: "25bcb878-749e-49f4-ac05-de84d964bcee", type: "chat" },
  "claude-opus-5": { id: "019f9521-eef3-7e2f-957d-eb53c2aeeb8b", type: "chat" },
  "claude-opus-5-high": { id: "019f9523-5899-75ca-bd4d-ada713338fee", type: "chat" },
  "claude-opus-5-high-vertex": { id: "019f9523-5899-75ca-bd4d-ada713338fee", type: "chat" },
  "claude-opus-5-low": { id: "019f9592-e2a8-79dd-a7ea-c2ad1c943b2d", type: "chat" },
  "claude-opus-5-low-vertex": { id: "019f9592-e2a8-79dd-a7ea-c2ad1c943b2d", type: "chat" },
  "claude-opus-5-max": { id: "019f9593-b5a9-7575-aff0-5971ff479f88", type: "chat" },
  "claude-opus-5-max-vertex": { id: "019f9593-b5a9-7575-aff0-5971ff479f88", type: "chat" },
  "claude-opus-5-medium": { id: "019f9592-d4b3-7456-8c36-315ff12c9d27", type: "chat" },
  "claude-opus-5-medium-vertex": { id: "019f9592-d4b3-7456-8c36-315ff12c9d27", type: "chat" },
  "claude-opus-5-vertex": { id: "019f9521-eef3-7e2f-957d-eb53c2aeeb8b", type: "chat" },
  "claude-sonnet-4-20250514": { id: "ac44dd10-0666-451c-b824-386ccfea7bcc", type: "chat" },
  "claude-sonnet-4-20250514-thinking-32k": { id: "4653dded-a46b-442a-a8fe-9bb9730e2453", type: "chat" },
  "claude-sonnet-4-5-20250929": { id: "019a2d13-28a5-7205-908c-0a58de904617", type: "chat" },
  "claude-sonnet-4-5-20250929-thinking-32k": { id: "b0ea1407-2f92-4515-b9cc-b22a6d6c14f2", type: "chat" },
  "claude-sonnet-4-5-search": { id: "019bda1f-3664-75d3-91b9-ede8f7561e44", type: "chat" },
  "claude-sonnet-4-6": { id: "019c6d29-a30c-7e20-9bd0-6650af926623", type: "chat" },
  "claude-sonnet-4-6-search": { id: "019c6f55-70d6-7a9c-b89b-9a0db36a3582", type: "chat" },
  "claude-sonnet-4-6-vertex": { id: "019c6d29-a30c-7e20-9bd0-6650af926623", type: "chat" },
  "claude-sonnet-5": { id: "019f19f2-41f1-7c6d-9891-48d02fd9952c", type: "chat" },
  "claude-sonnet-5-search": { id: "019f1a07-de72-7fbe-8d82-56dbd7348360", type: "chat" },
  "claude-sonnet-5-vertex": { id: "019f19f2-41f1-7c6d-9891-48d02fd9952c", type: "chat" },
  "cold-brew-vznw": { id: "019f24bf-9c2c-74dc-b218-deddd57fa496", type: "chat" },
  "cold_brew": { id: "019f24bf-9c2c-74dc-b218-deddd57fa496", type: "chat" },
  "cosmos3-super": { id: "019f91aa-b945-7411-a0cf-359f9f9f2360", type: "chat" },
  "cosmos3-super-agentic": { id: "019f91af-7ebe-7b8f-87c4-f3b16070a5d0", type: "chat" },
  "cosmos3-super-agentic-nvcf-v2": { id: "019f91af-7ebe-7b8f-87c4-f3b16070a5d0", type: "chat" },
  "cosmos3-super-nvcf-v2": { id: "019f91aa-b945-7411-a0cf-359f9f9f2360", type: "chat" },
  "december-chatbot": { id: "019b0aa7-334a-78e8-b2a8-885f31f4fc0c", type: "chat" },
  "deep-octo": { id: "019cf4e3-36a5-75a8-811d-1eaf867e3d0d", type: "chat" },
  "deepseek-v4-flash": { id: "019fb6fe-2537-75d5-97e7-0b383f3c9ce5", type: "chat" },
  "deepseek-v4-flash-20260730": { id: "019fb6fe-2537-75d5-97e7-0b383f3c9ce5", type: "chat" },
  "deepseek-v4-flash-low": { id: "019fb9c5-21ca-72b6-9c3d-1a4354d36dca", type: "chat" },
  "deepseek-v4-flash-max-20260731": { id: "019fb95f-214d-79ba-bf8c-2b1749f1feca", type: "chat" },
  "deepseek-v4-flash-thinking": { id: "019fb6fe-2a83-72ba-9d88-d221d780bae8", type: "chat" },
  "deepseek-v4-flash-thinking-20260730": { id: "019fb6fe-2a83-72ba-9d88-d221d780bae8", type: "chat" },
  "deepseek-v4-flash-vision-exp-high": { id: "01a026d5-1cdd-753d-9385-88d9b9206f6e", type: "chat" },
  "deepseek-v4-flash-vision-exp-low": { id: "01a026d5-18f7-7676-b6d6-b09ecbf23e89", type: "chat" },
  "deepseek-v4-flash-vision-exp-max": { id: "01a026d6-0e1b-7f70-afc8-ad8bd5e8ff56", type: "chat" },
  "deepseek-v4-pro": { id: "019ff722-292b-7b56-8f3b-b3217df5311b", type: "chat" },
  "deepseek-v4-pro-20260813": { id: "019ff722-292b-7b56-8f3b-b3217df5311b", type: "chat" },
  "deepseek-v4-pro-high": { id: "019ff724-a6da-7a59-89bb-c2a12e6d3c88", type: "chat" },
  "deepseek-v4-pro-high-20260813": { id: "019ff724-a6da-7a59-89bb-c2a12e6d3c88", type: "chat" },
  "deepseek-v4-pro-low": { id: "019ff723-7de4-7e71-b96a-846ef6a8b4c6", type: "chat" },
  "deepseek-v4-pro-low-20260813": { id: "019ff723-7de4-7e71-b96a-846ef6a8b4c6", type: "chat" },
  "deepseek-v4-pro-max": { id: "019ff726-084a-7050-8e72-484f784786e6", type: "chat" },
  "deepseek-v4-pro-max-20260813": { id: "019ff726-084a-7050-8e72-484f784786e6", type: "chat" },
  "devstral-2": { id: "019be7bf-bd7e-74d3-97ee-674fe4d9d8a9", type: "chat" },
  "devstral-medium-2507": { id: "019a6a30-cd7d-7431-8c4a-7be88deebf43", type: "chat" },
  "dola-seed-2.0-preview-text": { id: "019c6453-8727-7186-9523-e130170d2fb9", type: "chat" },
  "eren-v2": { id: "01a03125-7eb3-7289-8791-b5046097a337", type: "chat" },
  "eren-v2-2mgj": { id: "01a03125-7eb3-7289-8791-b5046097a337", type: "chat" },
  "farris": { id: "01a0398c-20e6-76fe-93e5-2b13a24d5e5e", type: "chat" },
  "farris-ees5": { id: "01a0398c-20e6-76fe-93e5-2b13a24d5e5e", type: "chat" },
  "ferric-wash-srxm": { id: "01a02283-5acf-7ac2-85f6-1ecc7f9994c6", type: "chat" },
  "ferric_wash": { id: "01a02283-5acf-7ac2-85f6-1ecc7f9994c6", type: "chat" },
  "flux-1-kontext-dev": { id: "eb90ae46-a73a-4f27-be8b-40f090592c9a", type: "chat" },
  "flux-1-kontext-pro": { id: "28a8f330-3554-448c-9f32-2c0a08ec6477", type: "chat" },
  "flux-2-dev": { id: "01a03a6f-d59f-76fa-bb26-764cd8ffd83b", type: "chat" },
  "flux-2-dev-global": { id: "01a03a6f-d59f-76fa-bb26-764cd8ffd83b", type: "chat" },
  "flux-2-pro": { id: "019b7541-5e4b-7ff7-a34b-b0255b6ca9aa", type: "chat" },
  "flux-2-pro-20251231": { id: "019b7541-5e4b-7ff7-a34b-b0255b6ca9aa", type: "chat" },
  "flux-3-video": { id: "019fde42-61fa-7d12-9f3f-6d2fc64365f7", type: "chat" },
  "flux-3-video-20260811-i2v": { id: "019ff26e-8f7e-70c1-8aaf-5c69fea18bf3", type: "chat" },
  "gemini-2.0-flash-001": { id: "7a55108b-b997-4cff-a72f-5aa83beee918", type: "chat" },
  "gemini-2.5-flash": { id: "0199f059-3877-7cfe-bc80-e01b1a4a83de", type: "chat" },
  "gemini-2.5-flash-image-preview (nano-banana)": { id: "0199ef2a-583f-7088-b704-b75fd169401d", type: "chat" },
  "gemini-2.5-pro": { id: "0199f060-b306-7e1f-aeae-0ebb4e3f1122", type: "chat" },
  "gemini-2.5-pro-grounding": { id: "b222be23-bd55-4b20-930b-a30cc84d3afd", type: "chat" },
  "gemini-3-flash": { id: "019b47da-49b9-7295-906c-ce44ccd30d74", type: "chat" },
  "gemini-3-flash (thinking-minimal)": { id: "019b5265-8405-799e-87af-199dc9f4ad4a", type: "chat" },
  "gemini-3-flash-grounding": { id: "019bda1f-3abc-783f-aac0-1ee102b247ba", type: "chat" },
  "gemini-3-flash-thinking-minimal-fixed-20251224": { id: "019b5265-8405-799e-87af-199dc9f4ad4a", type: "chat" },
  "gemini-3-pro-image-2k": { id: "019f1f85-dd80-7060-a1a8-2e0e85a60386", type: "chat" },
  "gemini-3-pro-image-2k (nano-banana-pro)": { id: "019f1f85-dd80-7060-a1a8-2e0e85a60386", type: "chat" },
  "gemini-3.1-flash-image (nano-banana-2)": { id: "019f1f86-ea47-711c-87ac-e01232af7ee7", type: "chat" },
  "gemini-3.1-flash-image (nano-banana-2) [web-search]": { id: "019f1f86-ea47-711c-87ac-e01232af7ee7", type: "chat" },
  "gemini-3.1-flash-lite": { id: "019f408a-186c-7f3a-9595-4e079e42a613", type: "chat" },
  "gemini-3.1-flash-lite-image": { id: "019fbb94-0662-7830-808f-ee8dfe6098a2", type: "chat" },
  "gemini-3.1-flash-lite-image (nano-banana-2-lite)": { id: "019fbb94-0662-7830-808f-ee8dfe6098a2", type: "chat" },
  "gemini-3.1-pro-grounding": { id: "019ce84a-f675-780c-a2bb-f86498a34de5", type: "chat" },
  "gemini-3.1-pro-preview": { id: "019c7820-5480-78b6-9fef-04c0d7004054", type: "chat" },
  "gemini-3.5-flash": { id: "019e37c2-46ec-735c-bf5b-63f1c00ec573", type: "chat" },
  "gemini-3.5-flash-high": { id: "019f406f-fc33-7b9d-9571-7b8443bc7ca0", type: "chat" },
  "gemini-3.5-flash-lite": { id: "019f90b1-cae9-786a-91a2-f3ee4c6cbf61", type: "chat" },
  "gemini-3.6-flash": { id: "019f90b1-c0ac-71ce-b295-487f261bf0f4", type: "chat" },
  "gemini-3.7-flash": { id: "01a03590-2058-7d1a-bae4-94295d7ad0ef", type: "chat" },
  "gemini-3.8-flash-high": { id: "01a0681c-b561-76b6-b338-a44ff0cff460", type: "chat" },
  "gemini-3.8-flash-low": { id: "01a0681d-ab3a-773c-96b4-caa51ac27e1d", type: "chat" },
  "gemini-3.8-flash-medium": { id: "01a0681c-c45d-7702-bbab-ca7c8621edc2", type: "chat" },
  "gemini-omni-1.1-flash": { id: "01a06df1-5f5b-7836-aa72-e17403ae8bb0", type: "chat" },
  "gemini-omni-flash": { id: "019fbb93-f92a-751c-b418-155052fcc6f8", type: "chat" },
  "gemma-3-27b-it": { id: "789e245f-eafe-4c72-b563-d135e93988fc", type: "chat" },
  "gemma-3n-e4b-it": { id: "896a3848-ae03-4651-963b-7d8f54b61ae8", type: "chat" },
  "glm-4.7": { id: "019becd0-af81-7883-a7ca-5c4a4e42ff7a", type: "chat" },
  "glm-4.7-text-fireworks": { id: "019becd0-af81-7883-a7ca-5c4a4e42ff7a", type: "chat" },
  "glm-5": { id: "019c45d7-96f0-7d39-8143-9d57941b5523", type: "chat" },
  "glm-5.1": { id: "019ebf6a-94d4-7649-b704-1dbbd5eb0942", type: "chat" },
  "glm-5.2": { id: "019ebf6a-94d4-7649-b704-1dbbd5eb0942", type: "chat" },
  "glm-5.3": { id: "01a00134-44ac-7f9c-b4a7-b720acebaa97", type: "chat" },
  "glm-5.3-flash": { id: "01a03a3b-64e3-790c-bdba-bd0e1c04b0f5", type: "chat" },
  "glm-5v-turbo": { id: "019d4a09-9651-78cb-86ea-bb0fa5ec77f4", type: "chat" },
  "global.amazon.nova-2-lite-v1:0": { id: "019ae300-83b7-7717-a1e0-31accd1ff6fa", type: "chat" },
  "gpt-4.1-2025-04-14": { id: "14e9311c-94d2-40c2-8c54-273947e208b0", type: "chat" },
  "gpt-4.1-mini-2025-04-14": { id: "6a5437a7-c786-467b-b701-17b0bc8c8231", type: "chat" },
  "gpt-5-chat": { id: "4b11c78c-08c8-461c-938e-5fc97d56a40d", type: "chat" },
  "gpt-5-high": { id: "983bc566-b783-4d28-b24c-3c8b08eb1086", type: "chat" },
  "gpt-5-high-new-system-prompt": { id: "19ad5f04-38c6-48ae-b826-f7d5bbfd79f7", type: "chat" },
  "gpt-5-medium": { id: "019a0ec1-e54d-7354-be40-62fb6f0e5d43", type: "chat" },
  "gpt-5-mini-high": { id: "5fd3caa8-fe4c-41a5-a22c-0025b58f4b42", type: "chat" },
  "gpt-5-nano-high": { id: "2dc249b3-98da-44b4-8d1e-6666346a8012", type: "chat" },
  "gpt-5-search": { id: "d14d9b23-1e46-4659-b157-a3804ba7e2ef", type: "chat" },
  "gpt-5.1": { id: "019a7ebf-0f3f-7518-8899-fca13e32d9dc", type: "chat" },
  "gpt-5.1-codex": { id: "019a84e2-e1b7-718b-8b8d-589079121b9b", type: "chat" },
  "gpt-5.1-codex-max": { id: "019aeb38-cc3b-7421-a472-0bfaaeace035", type: "chat" },
  "gpt-5.1-codex-mini": { id: "019a84e2-e6bd-7123-a5f6-626d1766d4f2", type: "chat" },
  "gpt-5.1-high": { id: "019a8548-a2b1-70ce-b1be-eba096d41f58", type: "chat" },
  "gpt-5.1-medium": { id: "019a95f0-02c7-7f62-a820-c809f767a222", type: "chat" },
  "gpt-5.1-search": { id: "019abdb7-50a5-7c05-9308-4491d069578b", type: "chat" },
  "gpt-5.1-search-new-system-prompt-20251217": { id: "019b2f68-97ae-75b1-9e2f-456470bd5332", type: "chat" },
  "gpt-5.1-search-sp": { id: "019b2f68-97ae-75b1-9e2f-456470bd5332", type: "chat" },
  "gpt-5.2": { id: "019bec65-0700-7279-911b-34e6aab53ad6", type: "chat" },
  "gpt-5.2-code-20260122": { id: "019bec65-0700-7279-911b-34e6aab53ad6", type: "chat" },
  "gpt-5.2-codex": { id: "019bbe75-406e-73de-8eeb-b2a60457cdf6", type: "chat" },
  "gpt-5.2-high": { id: "019bec66-03fe-7c18-8ee1-9c1414762f99", type: "chat" },
  "gpt-5.2-high-code-20260122": { id: "019bec66-03fe-7c18-8ee1-9c1414762f99", type: "chat" },
  "gpt-5.2-high-no-system-prompt-text": { id: "019b1449-0313-7911-b836-419e2ed79b2e", type: "chat" },
  "gpt-5.2-no-system-prompt-text": { id: "019b1448-ff14-7c98-a1ac-726fece799ec", type: "chat" },
  "gpt-5.2-search": { id: "019b1448-f74a-72de-b25d-8666618f8c5a", type: "chat" },
  "gpt-5.2-search-non-reasoning": { id: "019bda1e-bf3f-705b-b791-36db7a6ba906", type: "chat" },
  "gpt-5.3-codex": { id: "019cc0bf-aeb3-7a0f-9982-dab440effef3", type: "chat" },
  "gpt-5.3-codex-2026-03-05": { id: "019cc0bf-aeb3-7a0f-9982-dab440effef3", type: "chat" },
  "gpt-5.4-high": { id: "019cc0bb-af26-70d6-9271-ec771d778174", type: "chat" },
  "gpt-5.4-high-code-arena-harness": { id: "019cc0bb-af26-70d6-9271-ec771d778174", type: "chat" },
  "gpt-5.4-high-no-system-prompt": { id: "019cc5aa-2338-72fd-97dd-853736085a83", type: "chat" },
  "gpt-5.4-medium": { id: "019cc0bb-8758-7a5c-897d-7baf199c6c49", type: "chat" },
  "gpt-5.4-medium-code-arena-harness": { id: "019cc0bb-8758-7a5c-897d-7baf199c6c49", type: "chat" },
  "gpt-5.4-mini-high": { id: "019d0397-20a6-7e01-8bc6-ec5df604696d", type: "chat" },
  "gpt-5.4-mini-high-codex-harness": { id: "019d0397-20a6-7e01-8bc6-ec5df604696d", type: "chat" },
  "gpt-5.4-nano-high": { id: "019cfcdd-0bca-706f-92b5-a4c4cbd022d8", type: "chat" },
  "gpt-5.4-no-system-prompt": { id: "019cc5a9-cc73-721a-a124-efee4e783d1a", type: "chat" },
  "gpt-5.4-search": { id: "019cc0b6-0650-72eb-9294-47cb7e9a5d47", type: "chat" },
  "gpt-5.5": { id: "019dc0bb-ab8d-77bb-8315-424fc805b625", type: "chat" },
  "gpt-5.5-code-codex-harness": { id: "019dc0bb-ab8d-77bb-8315-424fc805b625", type: "chat" },
  "gpt-5.5-high": { id: "019dc0ba-0c5d-74cb-8bf2-096f460eadab", type: "chat" },
  "gpt-5.5-high-code-codex-harness": { id: "019dc0ba-0c5d-74cb-8bf2-096f460eadab", type: "chat" },
  "gpt-5.5-instant": { id: "019e71ea-1e1d-740f-9c2d-dab5869ff108", type: "chat" },
  "gpt-5.5-instant-2026-05-28": { id: "019e71ea-1e1d-740f-9c2d-dab5869ff108", type: "chat" },
  "gpt-5.5-search": { id: "019dc0ba-5395-7db4-9731-472e97acf221", type: "chat" },
  "gpt-5.5-xhigh": { id: "019dd034-9da3-772b-9589-dbcaca8b9dc5", type: "chat" },
  "gpt-5.5-xhigh-code-codex-harness": { id: "019dd034-9da3-772b-9589-dbcaca8b9dc5", type: "chat" },
  "gpt-5.6-luna-low": { id: "019f6bd2-2a38-7fec-a90c-4aedc5e112c0", type: "chat" },
  "gpt-5.6-luna-max": { id: "019fbe79-c3cb-7ccb-910a-70a2655a8e63", type: "chat" },
  "gpt-5.6-luna-medium": { id: "019f6bd1-9775-77ef-8a21-8f0fee31a4c9", type: "chat" },
  "gpt-5.6-luna-xhigh": { id: "019f4805-3856-78ef-8574-305f05f3f8d3", type: "chat" },
  "gpt-5.6-luna-xhigh-code-codex-harness": { id: "019f4805-3856-78ef-8574-305f05f3f8d3", type: "chat" },
  "gpt-5.6-sol-low": { id: "019f4dcd-1317-7109-b11b-5e8911c97a92", type: "chat" },
  "gpt-5.6-sol-max": { id: "019fbfb4-fd7b-76f8-81d5-63f3a4dc5525", type: "chat" },
  "gpt-5.6-sol-medium": { id: "019f4d64-388f-700b-b8c2-4d8d14c44973", type: "chat" },
  "gpt-5.6-sol-medium-code-codex-harness": { id: "019f4d64-388f-700b-b8c2-4d8d14c44973", type: "chat" },
  "gpt-5.6-sol-search-xhigh": { id: "019f4805-8efe-7437-bd2e-b78d3c9c28c4", type: "chat" },
  "gpt-5.6-sol-xhigh": { id: "019f47f5-9d0a-7a66-8d4e-009d05fc23ae", type: "chat" },
  "gpt-5.6-sol-xhigh-code-codex-harness": { id: "019f47f5-9d0a-7a66-8d4e-009d05fc23ae", type: "chat" },
  "gpt-5.6-terra-low": { id: "019f6bd1-7a97-7e61-ac2e-247ef73383b9", type: "chat" },
  "gpt-5.6-terra-max": { id: "019fbfb4-67ca-7524-9b7a-f71de524e976", type: "chat" },
  "gpt-5.6-terra-medium": { id: "019f6bd1-6a7d-76bc-afae-e79524333dbe", type: "chat" },
  "gpt-5.6-terra-xhigh": { id: "019f4805-04d1-7f3f-bd81-509e2784fa93", type: "chat" },
  "gpt-5.6-terra-xhigh-code-codex-harness": { id: "019f4805-04d1-7f3f-bd81-509e2784fa93", type: "chat" },
  "gpt-6-astra-max": { id: "01a06dd9-e831-7a56-b03c-9bd7b1fa1561", type: "chat" },
  "gpt-6-astra-max-code-codex-harness": { id: "01a06dd9-e831-7a56-b03c-9bd7b1fa1561", type: "chat" },
  "gpt-6-astra-search-max": { id: "01a06dd9-f8c5-77f5-90a2-335546d2d6d5", type: "chat" },
  "gpt-image-1": { id: "6e855f13-55d7-4127-8656-9168a9f4dcc0", type: "chat" },
  "gpt-image-1.5-high-fidelity": { id: "019be243-f89b-76a4-943d-553f46f62993", type: "chat" },
  "gpt-image-2 (medium)": { id: "019db344-75b0-7acd-aa20-bcc095ca0ed9", type: "chat" },
  "gpt-image-2-medium": { id: "019db344-75b0-7acd-aa20-bcc095ca0ed9", type: "chat" },
  "gpt-oss-120b": { id: "6ee9f901-17b5-4fbe-9cc2-13c16497c23b", type: "chat" },
  "gpt-oss-20b": { id: "ec3beb4b-7229-4232-bab9-670ee52dd711", type: "chat" },
  "granite-4.1-8b": { id: "019de522-c5eb-722f-a907-c79891cc6795", type: "chat" },
  "grok-4-1-fast-search": { id: "019af19c-0658-7566-9c60-112ae5bdb8db", type: "chat" },
  "grok-4-search": { id: "86d767b0-2574-4e47-a256-a22bcace9f56", type: "chat" },
  "grok-4.20-beta-0309-reasoning": { id: "019ce35b-20d0-7ff9-b788-19c010555fc5", type: "chat" },
  "grok-4.20-beta-0309-reasoning-code": { id: "019ce35b-20d0-7ff9-b788-19c010555fc5", type: "chat" },
  "grok-4.20-multi-agent-beta-0309": { id: "019ceb00-eef3-7df6-a025-00c9805ebd65", type: "chat" },
  "grok-4.20-multi-agent-beta-0309-search": { id: "019ceb00-eef3-7df6-a025-00c9805ebd65", type: "chat" },
  "grok-4.3": { id: "019de22d-1445-7296-9c88-a5877bc66ef8", type: "chat" },
  "grok-4.3-search": { id: "019de22d-1445-7296-9c88-a5877bc66ef8", type: "chat" },
  "grok-4.5": { id: "019f42aa-9c3b-76d1-8bdf-2e883b1ca227", type: "chat" },
  "grok-4.5-search": { id: "019f4e39-a888-7430-a6e7-ca2c33ec78f1", type: "chat" },
  "grok-4.6": { id: "019ff69c-b9db-752e-b8a1-ab2ffed728f0", type: "chat" },
  "grok-4.6-high": { id: "019ff69c-dae8-708a-ae20-1ce80775d94d", type: "chat" },
  "grok-4.6-high-public": { id: "019ff69c-dae8-708a-ae20-1ce80775d94d", type: "chat" },
  "grok-4.6-low": { id: "019ff69e-7c74-756f-be30-cb8adf7f16d5", type: "chat" },
  "grok-4.6-low-public": { id: "019ff69e-7c74-756f-be30-cb8adf7f16d5", type: "chat" },
  "grok-4.6-medium": { id: "019ff69d-0234-7d00-a218-8fefcc9b7a9d", type: "chat" },
  "grok-4.6-medium-public": { id: "019ff69d-0234-7d00-a218-8fefcc9b7a9d", type: "chat" },
  "grok-4.6-xhigh": { id: "019ff69c-b9db-752e-b8a1-ab2ffed728f0", type: "chat" },
  "grok-4.6-xhigh-public": { id: "019ff69c-b9db-752e-b8a1-ab2ffed728f0", type: "chat" },
  "grok-build-0.1": { id: "019e872e-ae0b-7929-9315-a46b8042d1b0", type: "chat" },
  "grok-imagine-image": { id: "019cc6e2-6e4a-76c1-bf57-76b12d98dbf3", type: "chat" },
  "grok-imagine-image-20260306": { id: "019cc6e2-6e4a-76c1-bf57-76b12d98dbf3", type: "chat" },
  "grok-imagine-image-quality": { id: "019e2e45-8f31-7ae2-ba00-214711bc2a1e", type: "chat" },
  "grok-imagine-video": { id: "019c78d9-8148-794d-ba5e-59c1a29a1dc3", type: "chat" },
  "grok-imagine-video-1.5-preview-720p": { id: "019e8ae6-4cee-76dc-9c2d-d3a646f5a5c9", type: "chat" },
  "grok-imagine-video-720p": { id: "019c2116-1107-7146-b617-c70a53abcb3f", type: "chat" },
  "grok-imagine-video-video-to-video": { id: "019c78d9-8148-794d-ba5e-59c1a29a1dc3", type: "chat" },
  "groudon": { id: "019ec9f6-5932-7156-aa54-8c913e29ac90", type: "chat" },
  "groudon-s41z": { id: "019ec9f6-5932-7156-aa54-8c913e29ac90", type: "chat" },
  "hailuo-02-fast": { id: "58060613-41dc-478b-97a0-6d9c4f0c722a", type: "chat" },
  "hailuo-02-pro": { id: "527e3f88-c13f-404c-92b4-0dcf7eeb61e6", type: "chat" },
  "hailuo-02-pro-image-to-video": { id: "527e3f88-c13f-404c-92b4-0dcf7eeb61e6", type: "chat" },
  "hailuo-02-pro-text-to-video": { id: "55069e04-a634-4d98-8765-95113b945f5e", type: "chat" },
  "hailuo-02-standard": { id: "bf03b5bb-8b4e-4a36-a893-0b2809f1daec", type: "chat" },
  "hailuo-02-standard-image-to-video": { id: "bf03b5bb-8b4e-4a36-a893-0b2809f1daec", type: "chat" },
  "hailuo-02-standard-text-to-video": { id: "e652c45e-8699-4392-94f0-7834e7464137", type: "chat" },
  "hailuo-2.3": { id: "019a1e21-7cb0-7778-9dd0-02ed4fb3563f", type: "chat" },
  "hailuo-2.3-fast": { id: "019a36dd-5d6c-7f15-8598-4755f4c34e28", type: "chat" },
  "hailuo-3": { id: "019fbbc9-b0ee-7912-83fe-a8afd9062c8f", type: "chat" },
  "hailuo-3-text-to-video": { id: "019fbbc9-b0ee-7912-83fe-a8afd9062c8f", type: "chat" },
  "hailuo-3-video-edit": { id: "019fb712-f49a-7258-aee2-28709a533d41", type: "chat" },
  "happyhorse-1.0-video-edit": { id: "019f05cc-d477-712a-a9c8-3a3ec1c61324", type: "chat" },
  "happyhorse-1.1": { id: "019f05cc-8b09-7951-ba23-4d97b76302c9", type: "chat" },
  "happyhorse-1.1-i2v": { id: "019f05cc-8b09-7951-ba23-4d97b76302c9", type: "chat" },
  "happyhorse-1.1-t2v": { id: "019f05cc-5c22-75d8-b99e-ffab36d62851", type: "chat" },
  "hidream-o1-image": { id: "019e1cd7-5cc5-75d2-8b3e-275616dec624", type: "chat" },
  "horseshoe": { id: "019fbf7c-0161-7e2c-ba1d-fa7b8eaae594", type: "chat" },
  "horseshoe-zflu": { id: "019fbf7c-0161-7e2c-ba1d-fa7b8eaae594", type: "chat" },
  "hunyuan-hy3-preview": { id: "01a03ba4-521a-7a61-a091-257a710b29ae", type: "chat" },
  "hunyuan-image-2.1": { id: "a9a26426-5377-4efa-bef9-de71e29ad943", type: "chat" },
  "hunyuan-image-3.0-i2i": { id: "019bec2d-e92c-745d-ae46-c7166590237a", type: "chat" },
  "hunyuan-video-1.5": { id: "019b28b8-5801-708c-9a7c-e77999d624d6", type: "chat" },
  "hunyuan-video-1.5-i2v-20251209": { id: "019b28b8-671b-7d8c-9d32-0cd757a60a6c", type: "chat" },
  "hunyuan-video-1.5-t2v-20251209": { id: "019b28b8-5801-708c-9a7c-e77999d624d6", type: "chat" },
  "hunyuan-vision-1.5-thinking": { id: "6a3a1e04-050e-4cb4-9052-b9ac4bec0c38", type: "chat" },
  "ibm-granite-h-small": { id: "4ddb69f5-391a-4f78-af92-7d7328c18ab1", type: "chat" },
  "ideogram-v3-quality": { id: "73378be5-cdba-49e7-b3d0-027949871aa6", type: "chat" },
  "inkling": { id: "019f6732-4365-7229-9518-02052d8d92fc", type: "chat" },
  "inkling-low": { id: "019f722d-ec5a-735e-bd31-51ee14c6af17", type: "chat" },
  "inkling-medium": { id: "019f722d-f655-7a00-8eb3-24d9be72a104", type: "chat" },
  "inkling-small": { id: "019fb49a-925f-7b4d-b89a-66ef7de2116d", type: "chat" },
  "inkling-small-low": { id: "019fba3f-d28c-7a06-a63f-871290dca150", type: "chat" },
  "inkling-small-medium": { id: "019fba3e-b802-72fd-8c5a-3d54e97a12b2", type: "chat" },
  "intellect-3": { id: "019aebfd-af0e-7f0c-8f0d-96c588e4cd3b", type: "chat" },
  "iron-bloom": { id: "019ef780-25ef-7878-8b91-307f8f879d42", type: "chat" },
  "iron-bloom-kosy": { id: "019ef780-25ef-7878-8b91-307f8f879d42", type: "chat" },
  "jaguar": { id: "019acbac-df7c-73dc-9716-ebe040daaa4e", type: "chat" },
  "k2": { id: "019d4231-5b3d-72d1-aa8c-04841b8eab5f", type: "chat" },
  "kandinsky-5.0-i2v-pro": { id: "019c8d5a-ebf3-78a9-b086-33719c7be210", type: "chat" },
  "kandinsky-5.0-t2v-lite": { id: "019a997a-88a7-7e5c-9214-ed2a946eb739", type: "chat" },
  "kandinsky-5.0-t2v-pro": { id: "019a997a-92dd-7588-ac3c-bdca7e81af37", type: "chat" },
  "kiana": { id: "019fe219-105a-7392-9098-379f0951580c", type: "chat" },
  "kiana-8mgg": { id: "019fe219-105a-7392-9098-379f0951580c", type: "chat" },
  "kimi-k2-0711-preview": { id: "7a3626fc-4e64-4c9e-821f-b449a4b43b6a", type: "chat" },
  "kimi-k2-0905-preview": { id: "b88e983b-9459-473d-8bf1-753932f1679a", type: "chat" },
  "kimi-k2-thinking-turbo": { id: "019a59bc-8bb8-7933-92eb-fe143770c211", type: "chat" },
  "kimi-k2.5": { id: "019d308f-e3c0-72e5-b819-f51d807653df", type: "chat" },
  "kimi-k2.5-20260327": { id: "019d308f-e3c0-72e5-b819-f51d807653df", type: "chat" },
  "kimi-k2.5-instant": { id: "019cb680-bae8-70e8-aacd-31f21dce7461", type: "chat" },
  "kimi-k2.5-instant-20260302": { id: "019cb680-bae8-70e8-aacd-31f21dce7461", type: "chat" },
  "kimi-k2.6": { id: "019dac5a-88e0-7477-b100-336eaf25c4b6", type: "chat" },
  "kimi-k2.6-code": { id: "019dac5a-88e0-7477-b100-336eaf25c4b6", type: "chat" },
  "kimi-k2.7-code": { id: "019ebd5b-a6ed-7e66-89e9-1143d106e0e6", type: "chat" },
  "kimi-k3": { id: "019fa76a-be4e-71cb-96bb-73e9720088e0", type: "chat" },
  "kimi-k3-v2": { id: "019f71b2-ff18-7818-b388-2c134f2b7963", type: "chat" },
  "kimi-k3-v3": { id: "019f7cb6-9dc5-70ef-aadb-e1287c3384e3", type: "chat" },
  "kimi-k3-webdev": { id: "019fa76a-be4e-71cb-96bb-73e9720088e0", type: "chat" },
  "kinsley": { id: "019faa02-bc24-70f4-afbe-6ae1e20d685a", type: "chat" },
  "kinsley-5jmg": { id: "019faa02-bc24-70f4-afbe-6ae1e20d685a", type: "chat" },
  "kinsley-mrp8": { id: "019faec4-558c-793a-b7b1-ea94c392877e", type: "chat" },
  "kiteki": { id: "019cddbe-a52e-720f-9398-0f40a2914b99", type: "chat" },
  "kizen-alpha": { id: "019daede-adf8-7f17-8545-d840f387a75c", type: "chat" },
  "kling-2.5-turbo-1080p": { id: "4cd188c8-4671-45a0-8433-dd89ce4e16a5", type: "chat" },
  "kling-o1-pro": { id: "019c78d9-c9b1-777a-9792-e0790121359d", type: "chat" },
  "kling-o1-pro-20260121": { id: "019be7ad-5596-7d09-adf2-bf3ada092cf3", type: "chat" },
  "kling-o1-pro-video-to-video": { id: "019c78d9-c9b1-777a-9792-e0790121359d", type: "chat" },
  "kling-o3-pro": { id: "019c78d9-ffe4-7a3a-913f-9570e3927788", type: "chat" },
  "kling-o3-pro-video-to-video": { id: "019c78d9-ffe4-7a3a-913f-9570e3927788", type: "chat" },
  "kling-v2.1-master": { id: "efdb7e05-2091-4e88-af9e-4ea6168d2f85", type: "chat" },
  "kling-v2.1-master-image-to-video": { id: "efdb7e05-2091-4e88-af9e-4ea6168d2f85", type: "chat" },
  "kling-v2.1-master-text-to-video": { id: "d63b03fb-8bc8-4ed8-9a50-6ccb683ac2b1", type: "chat" },
  "kling-v2.1-standard": { id: "ea96cfc8-953a-4c3c-a229-1107c55b7479", type: "chat" },
  "kling-v3": { id: "019c59fa-8a41-7042-baf7-121d052c04b8", type: "chat" },
  "kling-v3-image-to-video": { id: "019c59fa-8a41-7042-baf7-121d052c04b8", type: "chat" },
  "kling-v3-text-to-video": { id: "019c59fa-6567-7c42-97af-f51b52ce47d5", type: "chat" },
  "korin": { id: "019e36c3-691f-7ae8-b1eb-5db5435e29fe", type: "chat" },
  "korin-6hkw": { id: "019e36c3-691f-7ae8-b1eb-5db5435e29fe", type: "chat" },
  "krea-2-large": { id: "019e8ebd-6cfb-7492-949c-a2c4a00301aa", type: "chat" },
  "krea-2-medium": { id: "019e8ebd-8102-7dd1-aedb-af5a0ab5f83b", type: "chat" },
  "krea-2-turbo": { id: "019f049d-7de4-7fae-8237-1c2103b9e730", type: "chat" },
  "laguna-m.1-v2": { id: "019e6b66-c122-7556-a8c9-c42ade3ac335", type: "chat" },
  "laguna-xs-2.1": { id: "019f383c-727f-73cd-b1f6-5cf152447b6a", type: "chat" },
  "lhotse": { id: "019fd40c-e6c8-7d66-b5ab-72e6fa021030", type: "chat" },
  "ling-2.5-1t": { id: "019c6e76-fbbc-7e92-b0ba-784c7ef3ad8b", type: "chat" },
  "ling-flash-2.0": { id: "71f96ca9-4cf8-4be7-bac2-2231613930a6", type: "chat" },
  "lo-bah-png": { id: "019fde11-e7c8-7394-ac43-8fd3b37ba81c", type: "chat" },
  "lo-bah-png-uq1z": { id: "019fde11-e7c8-7394-ac43-8fd3b37ba81c", type: "chat" },
  "longcat-2.0": { id: "019f3a0a-bd19-7b19-9eed-a98453759b48", type: "chat" },
  "longcat-2.0-siliconflow": { id: "019f3a0a-bd19-7b19-9eed-a98453759b48", type: "chat" },
  "longcat-flash-chat": { id: "6fcbe051-f521-4dc7-8986-c429eb6191bf", type: "chat" },
  "ltx-2-19b": { id: "019bb42e-e9ee-75ca-9967-559a2bfb6c8b", type: "chat" },
  "ltx-2-19b-image-to-video": { id: "019bb42e-e9ee-75ca-9967-559a2bfb6c8b", type: "chat" },
  "ltx-2-19b-text-to-video": { id: "019bb42e-a2f0-73e6-a96e-a6f925341d9c", type: "chat" },
  "lucid-origin": { id: "5a3b3520-c87d-481f-953c-1364687b6e8f", type: "chat" },
  "march26-chatbot1-public": { id: "019cd9e3-c3ff-7225-92f2-c392259b1fbe", type: "chat" },
  "may-alpha": { id: "019e222b-e8b3-7f0a-85db-daa010a64f3e", type: "chat" },
  "may-alpha-0k1k": { id: "019e222b-e8b3-7f0a-85db-daa010a64f3e", type: "chat" },
  "may26-chatbot4-public": { id: "019e8ea8-2052-7f2e-b1b6-59bd94be5203", type: "chat" },
  "melyora": { id: "019e128d-bc7d-744c-8854-67a38b15b3a1", type: "chat" },
  "melyora-9qr6": { id: "019e128d-bc7d-744c-8854-67a38b15b3a1", type: "chat" },
  "mercury": { id: "019a6f77-e20d-7c1d-a7cd-8bd926e7395d", type: "chat" },
  "mercury-2": { id: "019cc65f-c1e3-7574-b332-898ab71c8211", type: "chat" },
  "mimo-v2.5": { id: "019db651-bd2f-7d80-ab12-d69c6bb623df", type: "chat" },
  "mimo-v2.5-pro": { id: "019db650-909d-7dec-8711-1907d7233cd4", type: "chat" },
  "minimax-h3-max": { id: "01a04423-3cd2-767a-9f26-0593ff09d518", type: "chat" },
  "minimax-h3-max-image-to-video": { id: "01a04423-3cd2-767a-9f26-0593ff09d518", type: "chat" },
  "minimax-h3-max-text-to-video": { id: "01a04421-8705-7ac3-b814-0b4750bf2ea3", type: "chat" },
  "minimax-m1": { id: "87e8d160-049e-4b4e-adc4-7f2511348539", type: "chat" },
  "minimax-m2": { id: "019a27e0-e7d8-7b0b-877c-a2106c6eb87d", type: "chat" },
  "minimax-m2-preview": { id: "019a17b5-5e1e-7df6-9e1a-6c4338f8b6ff", type: "chat" },
  "minimax-m2.1-preview": { id: "019b4231-1994-75a1-8567-8cba308fba55", type: "chat" },
  "minimax-m2.5": { id: "019c52a8-650a-7a55-b321-7fbc1c56588b", type: "chat" },
  "minimax-m3": { id: "019e809d-f62d-7192-bb7f-1657e066b5f2", type: "chat" },
  "mistral-large-3": { id: "019acbac-df7c-73dc-9716-ebe040daaa4e", type: "chat" },
  "mistral-medium-2505": { id: "27b9f8c6-3ee1-464a-9479-a8b3c2a48fd4", type: "chat" },
  "mistral-medium-2508": { id: "27035fb8-a25b-4ec9-8410-34be18328afd", type: "chat" },
  "mistral-medium-3.5": { id: "019f30a4-044d-7a14-9d3b-2e7299159e36", type: "chat" },
  "mistral-medium-3.5-v2": { id: "019f30a4-044d-7a14-9d3b-2e7299159e36", type: "chat" },
  "mistral-small-2506": { id: "bbad1d17-6aa5-4321-949c-d11fb6289241", type: "chat" },
  "mistral-small-2603": { id: "019cf983-532b-73fa-a057-7658e1e1c5ee", type: "chat" },
  "mistral-small-3.1-24b-instruct-2503": { id: "69f5d38a-45f5-4d3a-9320-b866a4035ed9", type: "chat" },
  "mizar-v2-85jb": { id: "019e6530-f140-77b1-b6b8-5c859829d992", type: "chat" },
  "mizar-v2-jxxi": { id: "019e6534-c9b7-7531-91f7-8d6ab180e67d", type: "chat" },
  "mochi-v1": { id: "f4809219-14a8-47fe-9705-8685085513e7", type: "chat" },
  "muse-spark": { id: "019f4312-57ac-7e26-910d-7a1e488cc6f6", type: "chat" },
  "muse-spark-1.2-low": { id: "019fd401-ecc8-71b8-92dd-9d3de2b71974", type: "chat" },
  "muse-spark-1.2-medium": { id: "019fd401-d256-7e5a-9056-46285d024c3d", type: "chat" },
  "muse-spark-1.2-xhigh": { id: "019fd401-b1c2-7e38-a201-5f9b3817adb3", type: "chat" },
  "muse-spark-1.3-xhigh": { id: "01a063c1-adb1-73e2-9c02-10b6e7cfb1eb", type: "chat" },
  "nonnas-meatballs-open-weight": { id: "019e703c-5dd4-7f94-b941-9f8b46c168dc", type: "chat" },
  "nova-2-lite": { id: "019ae300-83b7-7717-a1e0-31accd1ff6fa", type: "chat" },
  "nvidia-nemotron-3-nano-30b-a3b-bf16": { id: "019b0aa7-334a-78e8-b2a8-885f31f4fc0c", type: "chat" },
  "o3-2025-04-16": { id: "cb0f1e24-e8e9-4745-aabc-b926ffde7475", type: "chat" },
  "o3-mini": { id: "c680645e-efac-4a81-b0af-da16902b2541", type: "chat" },
  "o3-search": { id: "fbe08e9a-3805-4f9f-a085-7bc38e4b51d1", type: "chat" },
  "o4-mini-2025-04-16": { id: "f1102bbf-34ca-468f-a9fc-14bcf63f315b", type: "chat" },
  "onyx-v1-4": { id: "019fb542-0691-7552-89b9-198fbe5da905", type: "chat" },
  "onyx-v1-4-33s7": { id: "019fb542-0691-7552-89b9-198fbe5da905", type: "chat" },
  "paisley": { id: "019fc887-69e7-7308-a353-36da657fc18e", type: "chat" },
  "paisley-n9x0": { id: "019fc887-69e7-7308-a353-36da657fc18e", type: "chat" },
  "phoenix-qcs2": { id: "01a03ba4-521a-7a61-a091-257a710b29ae", type: "chat" },
  "photon": { id: "e7c9fa2d-6f5d-40eb-8305-0980b11c7cab", type: "chat" },
  "pika-v2.2": { id: "f9b9f030-9ebc-4765-bf76-c64a82a72dfd", type: "chat" },
  "pika-v2.2-image-to-video": { id: "f9b9f030-9ebc-4765-bf76-c64a82a72dfd", type: "chat" },
  "pika-v2.2-text-to-video": { id: "86de5aea-fc0c-4c36-b65a-7afc443a32d2", type: "chat" },
  "polaris": { id: "019feceb-bf62-71a6-8238-aea19b7b9d9b", type: "chat" },
  "polaris-dqm3": { id: "019feceb-bf62-71a6-8238-aea19b7b9d9b", type: "chat" },
  "porcelain": { id: "019fac44-b246-722d-ad6c-50863aff71fb", type: "chat" },
  "porcelain-k9cy": { id: "019fac44-b246-722d-ad6c-50863aff71fb", type: "chat" },
  "ppl-sonar-reasoning-pro-high": { id: "24145149-86c9-4690-b7c9-79c7db216e5c", type: "chat" },
  "pteronura": { id: "019d2cd2-dd83-75ab-a421-d0ba2e22b1e3", type: "chat" },
  "qwen-image-2.0": { id: "019d287c-4906-7f9c-8b78-8a2a86cf00a5", type: "chat" },
  "qwen-image-2.0-2026-03-03-v3": { id: "019d287c-4906-7f9c-8b78-8a2a86cf00a5", type: "chat" },
  "qwen-image-2.0-pro": { id: "019d287b-b718-7daa-ad65-502596d0813d", type: "chat" },
  "qwen-image-2.0-pro-2026-03-03-v3": { id: "019d287b-b718-7daa-ad65-502596d0813d", type: "chat" },
  "qwen-image-2512": { id: "019b8194-58e4-7975-ad6b-d966909a0eb8", type: "chat" },
  "qwen-image-edit": { id: "995cf221-af30-466d-a809-8e0985f83649", type: "chat" },
  "qwen-image-edit-2511": { id: "019b8194-804a-775d-86d4-c8ded9ba3e9f", type: "chat" },
  "qwen-vl-max-2025-08-13": { id: "6fe1ec40-3219-4c33-b3e7-0e65658b4194", type: "chat" },
  "qwen3-235b-a22b": { id: "2595a594-fa54-4299-97cd-2d7380d21c80", type: "chat" },
  "qwen3-235b-a22b-instruct-2507": { id: "ee7cb86e-8601-4585-b1d0-7c7380f8f6f4", type: "chat" },
  "qwen3-235b-a22b-no-thinking": { id: "1a400d9a-f61c-4bc2-89b4-a9b7e77dff12", type: "chat" },
  "qwen3-235b-a22b-thinking-2507": { id: "16b8e53a-cc7b-4608-a29a-20d4dac77cf2", type: "chat" },
  "qwen3-30b-a3b": { id: "9a066f6a-7205-4325-8d0b-d81cc4b049c0", type: "chat" },
  "qwen3-30b-a3b-instruct-2507": { id: "a8d1d310-e485-4c50-8f27-4bff18292a99", type: "chat" },
  "qwen3-coder-480b-a35b-instruct": { id: "af033cbd-ec6c-42cc-9afa-e227fc12efe8", type: "chat" },
  "qwen3-max-2025-09-23": { id: "98ad8b8b-12cd-46cd-98de-99edde7e03eb", type: "chat" },
  "qwen3-max-2025-09-26": { id: "ac31e980-8bf1-4637-adba-cf9ffa8b6343", type: "chat" },
  "qwen3-max-preview": { id: "019b9784-470e-75b9-b2fb-f005d78972e1", type: "chat" },
  "qwen3-max-preview-v2": { id: "019b9784-470e-75b9-b2fb-f005d78972e1", type: "chat" },
  "qwen3-max-thinking": { id: "019c1b89-cd55-7d2f-8a69-4da2372dbc41", type: "chat" },
  "qwen3-max-thinking-webdev": { id: "019c1b89-cd55-7d2f-8a69-4da2372dbc41", type: "chat" },
  "qwen3-next-80b-a3b-instruct": { id: "351fe482-eb6c-4536-857b-909e16c0bf52", type: "chat" },
  "qwen3-next-80b-a3b-thinking": { id: "73cf8705-98c8-4b75-8d04-e3746e1c1565", type: "chat" },
  "qwen3-omni-flash": { id: "0199c9dc-e157-7458-bd49-5942363be215", type: "chat" },
  "qwen3-vl-235b-a22b-instruct": { id: "716aa8ca-d729-427f-93ab-9579e4a13e98", type: "chat" },
  "qwen3-vl-235b-a22b-thinking": { id: "03c511f5-0d35-4751-aae6-24f918b0d49e", type: "chat" },
  "qwen3-vl-8b-instruct": { id: "0199e3d1-a713-7de2-a5dd-a1583cad9532", type: "chat" },
  "qwen3-vl-8b-thinking": { id: "0199e3d1-a308-77b9-a650-41453e8ef2fb", type: "chat" },
  "qwen3.5-122b-a10b": { id: "019c9270-083e-72b7-9bb6-ef32fe092f51", type: "chat" },
  "qwen3.5-122b-a10b-code": { id: "019c9270-c586-73c6-b2d9-673d5ec2e1d4", type: "chat" },
  "qwen3.5-27b": { id: "019c9240-6a0f-704e-954a-0d1e3b1b660c", type: "chat" },
  "qwen3.5-27b-code": { id: "019c9241-3e5a-7ab0-8c94-5d3b7c6dafad", type: "chat" },
  "qwen3.5-35b-a3b": { id: "019c9254-5c32-70d0-8877-afdfd3590e1d", type: "chat" },
  "qwen3.5-35b-a3b-code": { id: "019c9254-fda3-7824-bcf3-b4bac91bc094", type: "chat" },
  "qwen3.5-397b-a17b": { id: "019c6918-1d2a-7e3f-88ec-ada000b6ab16", type: "chat" },
  "qwen3.5-flash": { id: "019c9aff-e04b-746b-82bd-9c771362bcd9", type: "chat" },
  "qwen3.6-27b": { id: "019dc239-99a2-7747-9042-d1c47c8a3c24", type: "chat" },
  "qwen3.6-max-preview": { id: "019dd7a4-f384-79f0-aa10-c91147438642", type: "chat" },
  "qwen3.6-max-preview-code": { id: "019dd7a4-f384-79f0-aa10-c91147438642", type: "chat" },
  "qwen3.6-plus": { id: "019d50a9-ff12-7beb-b423-0b4904415f39", type: "chat" },
  "qwen3.6-plus-preview": { id: "019d4ec3-b69b-724b-9c43-4e7c6125dcbb", type: "chat" },
  "qwen3.6-plus-text": { id: "019d688c-b540-75ff-994d-338e3aec20ce", type: "chat" },
  "qwen3.7-max": { id: "019e6534-c9b7-7531-91f7-8d6ab180e67d", type: "chat" },
  "qwen3.7-plus": { id: "019e86fe-5125-74f6-a61d-e17146e786df", type: "chat" },
  "qwen3.7-plus-code": { id: "019e86fe-5125-74f6-a61d-e17146e786df", type: "chat" },
  "qwen3.8-27b": { id: "01a01327-1a98-7645-8595-06506a9c1f7f", type: "chat" },
  "qwen3.8-27b-code": { id: "01a01327-1a98-7645-8595-06506a9c1f7f", type: "chat" },
  "qwen3.8-27b-vision": { id: "01a01326-1eae-7f76-b985-3ca71503db99", type: "chat" },
  "qwen3.8-max-0902": { id: "01a06090-6905-7ad0-9ec2-18357142ec44", type: "chat" },
  "qwq-32b": { id: "885976d3-d178-48f5-a3f4-6e13e0718872", type: "chat" },
  "ray-3": { id: "fec7074d-a3a0-4f83-a487-82700fcec84d", type: "chat" },
  "ray2": { id: "5b3383a9-6bca-4f71-8210-78895c9d84d5", type: "chat" },
  "ray2-image-to-video": { id: "5b3383a9-6bca-4f71-8210-78895c9d84d5", type: "chat" },
  "recraft-v3": { id: "b88d5814-1d20-49cc-9eb6-e362f5851661", type: "chat" },
  "recraft-v4": { id: "019c6e76-a7c0-7b05-8dce-bbe3d52c8f4e", type: "chat" },
  "ring-2.5-1t": { id: "019c6e77-1b9f-7649-9136-43d07566c6c5", type: "chat" },
  "ring-2.5-1t-20260217": { id: "019c6e77-1b9f-7649-9136-43d07566c6c5", type: "chat" },
  "ring-flash-2.0": { id: "11ad4114-c868-4fed-b6e7-d535dc9c62f8", type: "chat" },
  "runway-gen-4.5": { id: "019c920d-8d0e-7625-a023-635cf4e9f5d5", type: "chat" },
  "runway-gen-4.5-text-to-video": { id: "019c920d-8d0e-7625-a023-635cf4e9f5d5", type: "chat" },
  "runway-gen4-aleph": { id: "019c78da-3629-73c6-8e04-0aba8eae64c8", type: "chat" },
  "runway-gen4-aleph-video-to-video": { id: "019c78da-3629-73c6-8e04-0aba8eae64c8", type: "chat" },
  "runway-gen4-turbo": { id: "0754baa1-ab91-42d0-ba74-522aa8e5b8e2", type: "chat" },
  "seedance-v1-lite": { id: "13ce11ba-def2-4c80-a70b-b0b2c14d293e", type: "chat" },
  "seedance-v1-lite-image-to-video": { id: "4c8dde6e-1b2c-45b9-91c3-413b2ceafffb", type: "chat" },
  "seedance-v1-lite-text-to-video": { id: "13ce11ba-def2-4c80-a70b-b0b2c14d293e", type: "chat" },
  "seedance-v1-pro": { id: "4ddc4e52-2867-49b6-a603-5aab24a566ca", type: "chat" },
  "seedance-v1-pro-image-to-video": { id: "4ddc4e52-2867-49b6-a603-5aab24a566ca", type: "chat" },
  "seedance-v1-pro-text-to-video": { id: "e705b65f-82cd-40cb-9630-d9e6ca92d06f", type: "chat" },
  "seededit-3.0": { id: "e2969ebb-6450-4bc4-87c9-bbdcf95840da", type: "chat" },
  "seedream-3": { id: "d8771262-8248-4372-90d5-eb41910db034", type: "chat" },
  "seedream-4.5": { id: "019b3943-7503-776f-9632-c3c5da0c39b7", type: "chat" },
  "seedream-5.0-lite": { id: "019c9078-386f-7c92-99f3-97d5d6b0f239", type: "chat" },
  "seedream-5.0-pro": { id: "019f42b5-8c52-7793-9be8-de35eecf7ea9", type: "chat" },
  "significant-otter": { id: "019d2cd3-2641-7628-94bd-67ecb0a7134e", type: "chat" },
  "snowflake": { id: "019c05a7-15e7-7305-adc2-0d5939fd6799", type: "chat" },
  "snowflake-v2": { id: "019c05a7-15e7-7305-adc2-0d5939fd6799", type: "chat" },
  "solar-pro4": { id: "01a03fe7-b31e-7d79-a6ee-8b82f683d02e", type: "chat" },
  "solar-pro4-openrouter": { id: "01a03fe7-b31e-7d79-a6ee-8b82f683d02e", type: "chat" },
  "sora": { id: "c3d0e5c8-f4b3-417a-8cb8-2ccf757d3869", type: "chat" },
  "sora-2": { id: "043a03a9-a792-4045-9f6d-4bcd747dac43", type: "chat" },
  "sora-2-pro": { id: "01f39601-03ed-4d66-8afb-5039c90b27ea", type: "chat" },
  "step-3.5-flash": { id: "019d22bb-fcf5-7866-9c07-de74fe05c9cc", type: "chat" },
  "step-3.5-flash-openrouter": { id: "019d22bb-fcf5-7866-9c07-de74fe05c9cc", type: "chat" },
  "sungod": { id: "019bec2d-e92c-745d-ae46-c7166590237a", type: "chat" },
  "super-nova-ext-3tam": { id: "019f4312-57ac-7e26-910d-7a1e488cc6f6", type: "chat" },
  "thunbergia-alpha": { id: "019fc361-b52b-7cb8-b2e5-c4339840ab39", type: "chat" },
  "thunbergia-alpha-9e3w": { id: "019f9566-85f7-7120-9d20-73b6a386f0ae", type: "chat" },
  "thunbergia-alpha-jz4q": { id: "019fc361-b52b-7cb8-b2e5-c4339840ab39", type: "chat" },
  "trinity-large": { id: "019c6e9c-b7f1-774b-8674-b0a795a49d8b", type: "chat" },
  "trinity-large-thinking": { id: "019d50aa-447d-74d6-8661-405b4b6de5de", type: "chat" },
  "uni-1.1": { id: "019ed208-3556-7d81-b768-f124f370145b", type: "chat" },
  "uni-1.1-max": { id: "019ed208-69ca-7f3f-85ee-182d5f0ea08b", type: "chat" },
  "vega": { id: "01a010ff-f14f-7953-bb48-27baf9105203", type: "chat" },
  "vega-v9e1": { id: "01a010ff-f14f-7953-bb48-27baf9105203", type: "chat" },
  "veo-2": { id: "08d8dcc6-2ab5-45ae-9bf1-353480f1f7ee", type: "chat" },
  "veo-3.1-audio": { id: "019f91b2-bf47-7455-a763-14f60c1d5f0c", type: "chat" },
  "veo-3.1-audio-1080p": { id: "019f91b3-a82a-7fce-b9d0-c5847008e059", type: "chat" },
  "veo-3.1-audio-1080p-ga-v1": { id: "019f91b3-a82a-7fce-b9d0-c5847008e059", type: "chat" },
  "veo-3.1-audio-4k": { id: "019f91b3-6ea2-744a-b698-d09fbadea9fa", type: "chat" },
  "veo-3.1-audio-4k-ga-v1": { id: "019f91b3-6ea2-744a-b698-d09fbadea9fa", type: "chat" },
  "veo-3.1-audio-ga-v1": { id: "019f91b2-bf47-7455-a763-14f60c1d5f0c", type: "chat" },
  "veo-3.1-fast-audio": { id: "019f91b3-9bd5-72a5-ab37-1b8c8f1dfc90", type: "chat" },
  "veo-3.1-fast-audio-1080p": { id: "019f91b2-af51-7239-a081-9c6ca572b12b", type: "chat" },
  "veo-3.1-fast-audio-1080p-ga-v1": { id: "019f91b2-af51-7239-a081-9c6ca572b12b", type: "chat" },
  "veo-3.1-fast-audio-4k": { id: "019f91b2-b157-77bf-bbb8-59763e6625db", type: "chat" },
  "veo-3.1-fast-audio-4k-ga-v1": { id: "019f91b2-b157-77bf-bbb8-59763e6625db", type: "chat" },
  "veo-3.1-fast-audio-ga-v1": { id: "019f91b3-9bd5-72a5-ab37-1b8c8f1dfc90", type: "chat" },
  "wan-v2.2-a14b": { id: "3a91bb37-39fb-471c-8aa2-a89b98d280d0", type: "chat" },
  "wan-v2.2-a14b-image-to-video": { id: "3a91bb37-39fb-471c-8aa2-a89b98d280d0", type: "chat" },
  "wan-v2.2-a14b-text-to-video": { id: "264e6e2f-b66a-4e27-a859-8145ff32d6f6", type: "chat" },
  "wan-vace": { id: "019c78d9-2a0f-7d8d-8b01-94bf9907d65e", type: "chat" },
  "wan-vace-video-to-video": { id: "019c78d9-2a0f-7d8d-8b01-94bf9907d65e", type: "chat" },
  "wan2.5-i2i-preview": { id: "019aeb62-c6ea-788e-88f9-19b1b48325b5", type: "chat" },
  "wan2.5-t2i-preview": { id: "019a5050-2875-78ed-ae3a-d9a51a438685", type: "chat" },
  "wan2.5-t2v-preview": { id: "019a74c8-5bf5-7f37-b0c4-4d597ea6f831", type: "chat" },
  "wan2.6-i2v": { id: "019c48d2-0f86-701d-beb2-af070edd1147", type: "chat" },
  "wan2.6-image": { id: "019bece2-d22d-7d91-8cc6-1d4ba4a35bbb", type: "chat" },
  "wan2.6-t2i": { id: "019c2473-76cc-76a0-a73d-3393599366ed", type: "chat" },
  "wan2.6-t2i-v2": { id: "019c2473-76cc-76a0-a73d-3393599366ed", type: "chat" },
  "wan2.6-t2v": { id: "019c48d2-6244-73d5-b6f0-c138efff5331", type: "chat" },
  "wan2.7-i2v": { id: "019e1cd6-1907-7b7c-837c-33a5a3b33b95", type: "chat" },
  "wan2.7-i2v-2026-04-25-v2": { id: "019e1cd6-1907-7b7c-837c-33a5a3b33b95", type: "chat" },
  "wan2.7-image": { id: "019db3ef-f2e3-7508-b3bc-c2ba377804ea", type: "chat" },
  "wan2.7-image-0421": { id: "019db3ef-f2e3-7508-b3bc-c2ba377804ea", type: "chat" },
  "wan2.7-image-pro": { id: "019db3f0-b024-7478-bd4d-55ea1ec1d421", type: "chat" },
  "wan2.7-image-pro-0421": { id: "019db3f0-b024-7478-bd4d-55ea1ec1d421", type: "chat" },
  "wan2.7-t2v": { id: "019de5a8-bff1-7059-a714-a62306010c70", type: "chat" },
  "wan2.7-t2v-2026-04-25": { id: "019de5a8-bff1-7059-a714-a62306010c70", type: "chat" },
  "zen-bear-v14r": { id: "019faa36-5563-74a3-938c-1105c79bdd92", type: "chat" },
  "zen-bear-v14r-z42u": { id: "019faa36-5563-74a3-938c-1105c79bdd92", type: "chat" },
  "zen-bear-v4": { id: "019e98fd-7a13-732a-93d6-2584d8b11d5a", type: "chat" },
  "zen-bear-v4-azoo": { id: "019e98fd-7a13-732a-93d6-2584d8b11d5a", type: "chat" },
};

function generateUUIDv7() {
  const now = Date.now(); // ms since epoch, fits in 48 bits
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Pack 48-bit timestamp into bytes[0..5] big-endian
  // Use division + modulo to avoid JS bitwise 32-bit truncation
  bytes[0] = Math.floor(now / 0x10000000000) & 0xff;  // bits 40-47
  bytes[1] = Math.floor(now / 0x100000000) & 0xff;     // bits 32-39
  bytes[2] = Math.floor(now / 0x1000000) & 0xff;       // bits 24-31
  bytes[3] = Math.floor(now / 0x10000) & 0xff;         // bits 16-23
  bytes[4] = Math.floor(now / 0x100) & 0xff;           // bits 8-15
  bytes[5] = now & 0xff;                               // bits 0-7

  // Set version = 7 in the high nibble of byte 6
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Set variant = 0b10 in the high two bits of byte 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function extractTextContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          if (typeof part.text === "string") return part.text;
          if (typeof part.content === "string") return part.content;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object") {
    if (typeof content.text === "string") return content.text;
    if (typeof content.content === "string") return content.content;
  }
  return "";
}

function buildUserPrompt(messages, bodyPrompt) {
  if (typeof bodyPrompt === "string" && bodyPrompt.trim().length > 0) {
    return bodyPrompt.trim();
  }
  if (Array.isArray(bodyPrompt) && bodyPrompt.length > 0) {
    return bodyPrompt.map(p => typeof p === "string" ? p : JSON.stringify(p)).join("\n");
  }
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return "";
  }
  if (messages.length === 1) {
    return extractTextContent(messages[0].content);
  }

  // Multi-turn conversation: use exact system prompt from IDE without adding any synthetic wrappers
  const parts = [];
  for (const m of messages) {
    const text = extractTextContent(m.content);
    if (!text || text.trim().length === 0) continue;
    if (m.role === "system") {
      // Pure system prompt directly from the IDE
      parts.push(text.trim());
    } else if (m.role === "assistant") {
      parts.push(`Assistant: ${text.trim()}`);
    } else {
      parts.push(text.trim());
    }
  }
  let prompt = parts.join("\n\n");
  if (prompt.length > 20000) {
    prompt = prompt.slice(-20000);
  }
  return prompt;
}

export class LMArenaProxyHub {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.browserWs = null;
    this.pendingStreams = new Map();
    this.requestQueue = [];
    this.activeRequestId = null;
    this.recentLogs = [];
    this.models = { ...DEFAULT_MODELS };
  }

  async waitForBrowserConnection(timeoutMs = 25000) {
    if (this.browserWs) return true;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 500));
      if (this.browserWs) return true;
    }
    return false;
  }

  processQueue() {
    if (!this.browserWs || this.activeRequestId || this.requestQueue.length === 0) {
      return;
    }
    const nextReq = this.requestQueue.shift();
    this.activeRequestId = nextReq.requestId;
    try {
      this.browserWs.send(JSON.stringify({
        action: "create-evaluation",
        request_id: nextReq.requestId,
        payload: nextReq.payload
      }));
      this.log(`[Queue] Dispatched ${nextReq.requestId} for model ${nextReq.modelName} (Queued remaining: ${this.requestQueue.length})`);
    } catch (err) {
      this.activeRequestId = null;
      this.pendingStreams.delete(nextReq.requestId);
      this.log(`[Queue] Failed to dispatch ${nextReq.requestId}: ${err.message}`);
      setTimeout(() => this.processQueue(), 500);
    }
  }

  releaseRequest(requestId) {
    if (this.activeRequestId === requestId) {
      this.activeRequestId = null;
      // 3500ms pacing gap between requests so upstream arena.ai prompt rate limit is never tripped
      setTimeout(() => this.processQueue(), 3500);
    }
  }

  log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    this.recentLogs.push(line);
    if (this.recentLogs.length > 50) {
      this.recentLogs.shift();
    }
  }


  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    // 1. WebSocket endpoint for the Browser Injector
    if (path === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket connection", { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();
      this.browserWs = server;
      this.log("Browser WebSocket connected successfully!");

      server.addEventListener("message", (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Browser status report
          if (msg.action === "report_status") {
            this.log(`Browser status: URL=${msg.url} | Cookies=${msg.cookies}`);
            return;
          }

          // Registry update from browser
          if (msg.action === "register_models" && msg.models) {
            const count = Object.keys(msg.models).length;
            this.log(`Received ${count} dynamic models from browser injector`);
            this.models = { ...this.models, ...msg.models };
            return;
          }

          // Stream chunks from browser
          if (msg.request_id && this.pendingStreams.has(msg.request_id)) {
            const streamInfo = this.pendingStreams.get(msg.request_id);
            const { controller, isStreaming, model, completionId, created } = streamInfo;

            if (msg.error) {
              const errMessage = typeof msg.error === "string" ? msg.error : JSON.stringify(msg.error);
              this.log(`Stream error for ${msg.request_id}: ${errMessage}`);
              try {
                if (isStreaming) {
                  const delta = streamInfo.hasSentFirstChunk
                    ? { content: `\n\n[Proxy Notice: ${errMessage}]` }
                    : { role: "assistant", content: `[Proxy Notice: ${errMessage}]` };
                  const errChunk = {
                    id: completionId,
                    object: "chat.completion.chunk",
                    created: created,
                    model: model,
                    choices: [{
                      index: 0,
                      delta: delta,
                      finish_reason: "stop"
                    }]
                  };
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errChunk)}\n\n`));
                  controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                } else {
                  const errResponse = {
                    id: completionId,
                    object: "chat.completion",
                    created: created,
                    model: model,
                    choices: [{
                      index: 0,
                      message: { role: "assistant", content: `[Proxy Notice: ${errMessage}]` },
                      finish_reason: "stop"
                    }],
                    usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 }
                  };
                  controller.enqueue(new TextEncoder().encode(JSON.stringify(errResponse)));
                }
                controller.close();
              } catch (_) {}
              this.pendingStreams.delete(msg.request_id);
              this.releaseRequest(msg.request_id);
              return;
            }

            if (msg.data !== undefined) {
              if (msg.data === "[DONE]" || (typeof msg.data === "string" && msg.data.startsWith("ad:"))) {
                if (!streamInfo.finished) {
                  streamInfo.finished = true;
                  if (isStreaming) {
                    const finishChunk = {
                      id: completionId,
                      object: "chat.completion.chunk",
                      created: created,
                      model: model,
                      choices: [{
                        index: 0,
                        delta: {},
                        finish_reason: "stop"
                      }]
                    };
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(finishChunk)}\n\n`));
                    controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                    controller.close();
                  } else {
                    const responseContent = streamInfo.accumulatedContent || (streamInfo.lastError ? `[Proxy Notice: ${streamInfo.lastError}]` : "");
                    const promptToks = Math.max(1, Math.ceil((streamInfo.promptLength || 10) / 4));
                    const compToks = Math.max(1, Math.ceil(responseContent.length / 4));
                    const responseJson = {
                      id: completionId,
                      object: "chat.completion",
                      created: created,
                      model: model,
                      choices: [{
                        index: 0,
                        message: { role: "assistant", content: responseContent },
                        finish_reason: "stop"
                      }],
                      usage: {
                        prompt_tokens: promptToks,
                        completion_tokens: compToks,
                        total_tokens: promptToks + compToks
                      }
                    };
                    controller.enqueue(new TextEncoder().encode(JSON.stringify(responseJson)));
                    controller.close();
                  }
                }
                this.pendingStreams.delete(msg.request_id);
                this.releaseRequest(msg.request_id);
              } else if (typeof msg.data === "string" && (msg.data.startsWith("a0:") || msg.data.startsWith("0:"))) {
                try {
                  const prefixLen = msg.data.startsWith("a0:") ? 3 : 2;
                  const text = JSON.parse(msg.data.slice(prefixLen));
                  streamInfo.accumulatedContent += text;
                  if (isStreaming) {
                    const delta = streamInfo.hasSentFirstChunk
                      ? { content: text }
                      : { role: "assistant", content: text };
                    streamInfo.hasSentFirstChunk = true;

                    const chunk = {
                      id: completionId,
                      object: "chat.completion.chunk",
                      created: created,
                      model: model,
                      choices: [{
                        index: 0,
                        delta: delta,
                        finish_reason: null
                      }]
                    };
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  }
                } catch (_) {}
              } else {
                // Check if message is error JSON
                try {
                  const parsed = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
                  if (parsed && parsed.error) {
                    const errMsg = typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
                    this.log(`Error from browser for ${msg.request_id}: ${errMsg}`);
                    streamInfo.lastError = errMsg;
                    if (isStreaming) {
                      const delta = streamInfo.hasSentFirstChunk
                        ? { content: `\n\n[Proxy Notice: ${errMsg}]` }
                        : { role: "assistant", content: `[Proxy Notice: ${errMsg}]` };
                      streamInfo.hasSentFirstChunk = true;
                      const errChunk = {
                        id: completionId,
                        object: "chat.completion.chunk",
                        created: created,
                        model: model,
                        choices: [{
                          index: 0,
                          delta: delta,
                          finish_reason: null
                        }]
                      };
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errChunk)}\n\n`));
                    }
                  }
                } catch (_) {}
              }
            }
          }
        } catch (e) {
          this.log(`WS error parsing message: ${e.message}`);
        }
      });

      server.addEventListener("close", () => {
        if (this.browserWs === server) {
          this.browserWs = null;
          this.log("Browser WebSocket disconnected");
        }
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // Debug logs endpoint
    if (path === "/debug") {
      return Response.json({
        browserConnected: this.browserWs !== null,
        modelCount: Object.keys(this.models).length,
        logs: this.recentLogs
      }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // Normalize path to handle /v1/models, /models, /v1/chat/completions, /chat/completions, /v1/v1/...
    const normalizedPath = path.replace(/^\/v1\/v1/, "/v1").replace(/^\/v1/, "");

    // 2. OpenAI /v1/models (and /models)
    if (normalizedPath === "/models" || path === "/v1/models" || path === "/models") {
      const data = Object.keys(this.models).map((name) => ({
        id: name,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "lmarena"
      }));
      return Response.json({ object: "list", data }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // 3. OpenAI /v1/chat/completions (and /chat/completions)
    if ((normalizedPath === "/chat/completions" || path === "/v1/chat/completions" || path === "/chat/completions") && request.method === "POST") {
      if (!this.browserWs) {
        const connected = await this.waitForBrowserConnection(25000);
        if (!connected) {
          return Response.json(
            { error: { message: "Cloud browser bridge is initializing. Please retry in 10 seconds.", type: "service_unavailable" } },
            { status: 503, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } }
          );
        }
      }

      const body = await request.json();
      const requestedModel = body.model || "gemini-2.5-flash";

      // Common IDE model aliases map seamlessly to high-tier Arena models
      const aliases = {
        "gpt-4o": "gpt-5-chat",
        "gpt-4": "gpt-5-chat",
        "gpt-4-turbo": "gpt-4.1-2025-04-14",
        "gpt-4o-mini": "gpt-5-nano-high",
        "gpt-3.5-turbo": "gemini-2.5-flash",
        "claude-3-5-sonnet": "claude-opus-4-7-thinking",
        "claude-3-7-sonnet": "claude-opus-4-7-thinking",
        "claude-3-5-sonnet-20241022": "claude-opus-4-7-thinking",
        "claude-3-7-sonnet-20250219": "claude-opus-4-7-thinking",
        "claude-3-opus": "claude-opus-4-7-thinking",
        "claude-3-sonnet": "claude-sonnet-4-5-20250929",
        "claude-sonnet-4": "claude-sonnet-4-5-20250929",
        "deepseek-chat": "deepseek-v3-0324",
        "deepseek-coder": "deepseek-v3-0324",
        "deepseek-reasoner": "deepseek-v4-flash-thinking",
        "deepseek-r1": "deepseek-v4-flash-thinking",
        "gemini-pro": "gemini-2.5-pro",
        "gemini-flash": "gemini-2.5-flash",
        "gemini-1.5-pro": "gemini-2.5-pro",
        "gemini-1.5-flash": "gemini-2.5-flash",
        "gemini-2.0-flash": "gemini-2.0-flash-001",
        "default": "gemini-2.5-flash"
      };

      let modelName = requestedModel;
      if (!this.models[modelName]) {
        const lower = modelName.toLowerCase();
        if (aliases[lower]) {
          modelName = aliases[lower];
        } else {
          // Look for partial match in registered models
          const matchedKey = Object.keys(this.models).find(k => {
            const kl = k.toLowerCase();
            return kl === lower || kl.includes(lower) || lower.includes(kl);
          });
          if (matchedKey) {
            modelName = matchedKey;
          }
        }
      }

      // If still unknown, fallback to gemini-2.5-flash instead of failing the IDE
      const modelInfo = this.models[modelName] || this.models["gemini-2.5-flash"];
      const requestId = generateUUIDv7();
      const completionId = `chatcmpl-${generateUUIDv7()}`;
      const createdTime = Math.floor(Date.now() / 1000);
      const isStreaming = body.stream !== false;

      // Transform OpenAI messages into exact LMArena payload using UUIDv7
      const evaluationId = generateUUIDv7();
      const userMessageId = generateUUIDv7();
      const modelAMessageId = generateUUIDv7();
      const messages = body.messages || [];

      // Extract user prompt cleanly (supports string, array of parts, prompt, multi-turn context)
      const userPrompt = buildUserPrompt(messages, body.prompt);

      // arena.ai assigns a new evaluation ID per call, so every request starts a new evaluation session.
      // Mode must ALWAYS be "direct-battle" to avoid: "'direct' mode is not allowed when starting a new conversation"
      const evaluationMode = "direct-battle";

      const lmarenaPayload = {
        id: evaluationId,
        mode: evaluationMode,
        modelAId: modelInfo.id,
        userMessageId: userMessageId,
        modelAMessageId: modelAMessageId,
        userMessage: {
          content: userPrompt,
          experimental_attachments: []
        },
        modality: "chat"
      };


      // Set up stream / response
      const stream = new ReadableStream({
        start: (controller) => {
          this.pendingStreams.set(requestId, {
            controller,
            isStreaming,
            model: requestedModel, // Return the exact model the IDE requested
            completionId,
            created: createdTime,
            hasSentFirstChunk: false,
            promptLength: userPrompt.length,
            accumulatedContent: "",
            finished: false
          });
        },
        cancel: () => {
          this.pendingStreams.delete(requestId);
          this.releaseRequest(requestId);
          if (this.browserWs) {
            try {
              this.browserWs.send(JSON.stringify({ action: "abort", request_id: requestId }));
            } catch (_) {}
          }
        }
      });

      // Enqueue request into serialized queue to guarantee one request at a time upstream
      this.requestQueue.push({
        requestId,
        payload: lmarenaPayload,
        modelName
      });
      this.log(`[Queue] Enqueued request ${requestId} for model ${modelName} (Queue depth: ${this.requestQueue.length})`);
      this.processQueue();

      if (isStreaming) {
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          }
        });
      } else {
        return new Response(stream, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          }
        });
      }
    }

    return new Response("LMArena Cloudflare Gateway. Available endpoints: /v1/models, /v1/chat/completions, /ws, /debug", {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/direct-test") {
      try {
        const v0 = 'base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpBNVlUSTNPVFl6TFRjek5tWXROR00wWmkwNU5HSXlMV0ptWXpSaU1XSTJNV1k0T0NJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmgxYjJkNmIyVnhlbU55WkhacmQzUjJiMlJwTG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lKaFpEZzNZelU1WWkwM016RTRMVFExT0dVdE9XRXhZUzFtWm1Sak9UazNPV1UyWm1VaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemc0TlRVME5qY3pMQ0pwWVhRaU9qRTNPRGcxTlRFd056TXNJbVZ0WVdsc0lqb2lZMmhwYm0xaGVXRjNZWE4wYUdrNE56WkFaMjFoYVd3dVkyOXRJaXdpY0dodmJtVWlPaUlpTENKaGNIQmZiV1YwWVdSaGRHRWlPbnNpY0hKdmRtbGtaWElpT2lKbmIyOW5iR1VpTENKd2NtOTJhV1JsY25NaU9sc2laMjl2WjJ4bElsMTlMQ0oxYzJWeVgyMWxkR0ZrWVhSaElqcDdJbUYyWVhSaGNsOTFjbXdpT2lKb2RIUndjem92TDJ4b015NW5iMjluYkdWMWMyVnlZMjl1ZEdWdWRDNWpiMjB2WVM5QlEyYzRiMk5KVGxOSVlYRmxjR1JFTmtOVmIwbERkblZ0ZVhoMlFuZHFPR2xuZERsSlZYRnVVMkZwTjNWZk5FcE5Va0ZUUFhNNU5pMWpJaXdpWlcxaGFXd2lPaUpqYUdsdWJXRjVZWGRoYzNSb2FUZzNOa0JuYldGcGJDNWpiMjBpTENKbGJXRnBiRjkyWlhKcFptbGxaQ0k2ZEhKMVpTd2lablZzYkY5dVlXMWxJam9pUTJocGJtMWhlU0lzSW1sa0lqb2lNREZoTURaa1pqTXROR1pqWmkwM1lUQXdMV0V4TVRrdE16azNOekk1TXpCbU5HUTRJaXdpYVhOeklqb2lhSFIwY0hNNkx5OWhZMk52ZFc1MGN5NW5iMjluYkdVdVkyOXRJaXdpYkdGemRGOXNhVzVyWldSZmMzVndZV0poYzJWZmRYTmxjbDlwWkNJNklqUmpZVEppWTJZNExUUTRPRFV0TkRRd01TMWhPVEF4TFRreU5XUTRNbVF4TURJeE55SXNJbTVoYldVaU9pSkRhR2x1YldGNUlpd2ljR2h2Ym1WZmRtVnlhV1pwWldRaU9tWmhiSE5sTENKd2FXTjBkWEpsSWpvaWFIUjBjSE02THk5c2FETXVaMjl2WjJ4bGRYTmxjbU52Ym5SbGJuUXVZMjl0TDJFdlFVTm5PRzlqU1U1VFNHRnhaWEJrUkRaRFZXOUpRM1oxYlhsNGRrSjNhamhwWjNRNVNWVnhibE5oYVRkMVh6UktUVkpCVXoxek9UWXRZeUlzSW5CeWIzWnBaR1Z5WDJsa0lqb2lNVEUwTXprNE16Z3hNakkzTlRJeE5qWXdOak0xSWl3aWMzVmlJam9pTVRFME16azRNemd4TWpJM05USXhOall3TmpNMUluMHNJbkp2YkdVaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVlXRnNJam9pWVdGc01TSXNJbUZ0Y2lJNlczc2liV1YwYUc5a0lqb2liMkYxZEdnaUxDSjBhVzFsYzNSaGJYQWlPakUzT0RnMU5URXdOek45WFN3aWMyVnpjMmx2Ymw5cFpDSTZJamMyWm1Vek1UaG1MVEEzTXpJdE5EY3pOaTFoT0RBNUxUYzFOakEyT1dWa09EYzROeUlzSW1selgyRnViMjU1Ylc5MWN5STZabUZzYzJWOS5EN0o5dUp2czN0QmNkT2lxaU1XSWpDSWF4UXJIajZVRF8zSmt5OWEzcEltVllZWEk5THZSYVZ4c1pZVERwWVMzY21RSUdDbHpOVTZtaGpKY2dQbUV1dyIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzg4NTU0NjczLCJyZWZyZXNoX3Rva2VuIjoieTNjb3RyeWd1eG1nIiwidXNlciI6eyJpZCI6ImFkODdjNTliLTczMTgtNDU4ZS05YTFhLWZmZGM5OTc5ZTZmZSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoiY2hpbm1heWF3YXN0aGk4NzZAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wOS0wNFQxOTo0NDozMy4yODAwNzZaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI4MDA3NloiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjY1NjY1NVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJTlNIYXFlcGRENkNVb0lDdnVteXh2QndqOGlndDlJVXFuU2FpN3VfNEpNUkFTPXM5Ni1jIiwiZW1haWwiOiJjaGlubWF5YXdhc3RoaTg3NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQ2hpbm1heSIsImlkIjoiMDFhMDZkZjMtNGZjZi03YTAwLWExMTktMzk3NzI5MzBmNGQ4IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibGFzdF9saW5rZWRfc3VwYWJhc2VfdXNlcl9pZCI6IjRjYTJiY2Y4LTQ4ODUtNDQwMS1hOTAxLTkyNWQ4MmQxMDIxNyIsIm5hbWUiOiJDaGlubWF5IiwicGhvbmVfdmVyaWZpZWQiOmZhb';
        const v1 = 'HNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU5TSGFxZXBkRDZDVW9JQ3Z1bXl4dkJ3ajhpZ3Q5SVVxblNhaTd1XzRKTVJBUz1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTE0Mzk4MzgxMjI3NTIxNjYwNjM1Iiwic3ViIjoiMTE0Mzk4MzgxMjI3NTIxNjYwNjM1In0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiZWE4YTU3OTEtMjNkYy00ZGMzLWJjNzktNTJmOTYzM2EzMzFmIiwiaWQiOiIxMTQzOTgzODEyMjc1MjE2NjA2MzUiLCJ1c2VyX2lkIjoiYWQ4N2M1OWItNzMxOC00NThlLTlhMWEtZmZkYzk5NzllNmZlIiwiaWRlbnRpdHlfZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU5TSGFxZXBkRDZDVW9JQ3Z1bXl4dkJ3ajhpZ3Q5SVVxblNhaTd1XzRKTVJBUz1zOTYtYyIsImVtYWlsIjoiY2hpbm1heWF3YXN0aGk4NzZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkNoaW5tYXkiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiQ2hpbm1heSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lOU0hhcWVwZEQ2Q1VvSUN2dW15eHZCd2o4aWd0OUlVcW5TYWk3dV80Sk1SQVM9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExNDM5ODM4MTIyNzUyMTY2MDYzNSIsInN1YiI6IjExNDM5ODM4MTIyNzUyMTY2MDYzNSJ9LCJwcm92aWRlciI6Imdvb2dsZSIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjYtMDktMDRUMTk6NDQ6MzMuMjc1OTkzWiIsImNyZWF0ZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI3NjAzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wOS0wNFQxOTo0NDozMy4yNzYwMzRaIiwiZW1haWwiOiJjaGlubWF5YXdhc3RoaTg3NkBnbWFpbC5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI3MzEzOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wOS0wNFQxOTo0NDozMy44MjI4OTJaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX19';
        const bm = 'xJ933ob22iraDRoHwx4Sn_nyWR2Jt39VDGnL.Ir.J4M-1788551058.395609-1.0.1.1-kCBW8p45U4M4pWdLs.2epMPdVDDr08UlzEfygXckku7YOpP09hNdzfhTLQYvuFmnfLmKzXX.exEmccxEYjY8ELER79bzdmg7DskWVX6cT7Y8SE.Ws9HvXB9Jqb9VyVUV';
        const now = Date.now();
        const freshVisit = { id: generateUUIDv7(), started: now - 15000, lastSeen: now };
        const visitId = encodeURIComponent(JSON.stringify(freshVisit));
        const cookieHdr = `arena-auth-prod-v1.0=${v0}; arena-auth-prod-v1.1=${v1}; __cf_bm=${bm}; arena_visit_id=${visitId}; user_country_code=IN`;
        
        const payload = {
          id: generateUUIDv7(),
          mode: "direct-battle",
          modelAId: "019ff69c-dae8-708a-ae20-1ce80775d94d",
          userMessageId: generateUUIDv7(),
          modelAMessageId: generateUUIDv7(),
          userMessage: { content: "Say hi in 3 words", experimental_attachments: [] },
          modality: "chat"
        };

        const resp = await fetch("https://arena.ai/nextjs-api/stream/create-evaluation", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            "Accept": "*/*",
            "Origin": "https://arena.ai",
            "Referer": "https://arena.ai/text/direct",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Cookie": cookieHdr
          },
          body: JSON.stringify(payload)
        });
        const text = await resp.text();
        return new Response(`Worker Direct Status: ${resp.status}\nBody: ${text.slice(0, 300)}`);
      } catch (err) {
        return new Response(`Worker Direct Error: ${err.message}\nStack: ${err.stack}`, { status: 500 });
      }
    }

    if (url.pathname === "/test") {
      return new Response("TEST OK");
    }
    if (!env.PROXY_HUB) {
      return new Response("Missing Durable Object PROXY_HUB binding in wrangler.toml", { status: 500 });
    }
    const id = env.PROXY_HUB.idFromName("global");
    const stub = env.PROXY_HUB.get(id);

    return stub.fetch(request);
  }
};
