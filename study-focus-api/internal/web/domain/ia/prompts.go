package ia

import "fmt"

const SystemInstruction = `Você é um tutor acadêmico conciso.
Responda em português do Brasil, com clareza e foco na dúvida do aluno.
Siga rigorosamente as instruções de formato enviadas no prompt do usuário.`

func BuildGlobalChatPrompt(pergunta string) string {
	return fmt.Sprintf(`Responda à pergunta abaixo de forma breve e direta, focando apenas no essencial.
Não gere flashcards, não inclua JSON e não use o marcador "### [FLASHCARDS]".

Pergunta do aluno: %s`, pergunta)
}

func BuildDisciplinaChatPrompt(disciplina, assunto, pergunta string) string {
	return fmt.Sprintf(`Contexto: O aluno está estudando a disciplina "%s" e o assunto "%s".
Pergunta do aluno: %s

Responda seguindo rigorosamente esta estrutura:
1. Uma explicação completa, didática e detalhada sobre a dúvida do aluno, organizada em Markdown.
   - Comece respondendo diretamente à pergunta.
   - Explique os conceitos principais com linguagem simples e progressiva.
   - Relacione a resposta com a disciplina e o assunto informados no contexto.
   - Inclua exemplos curtos, analogias ou passos práticos quando isso ajudar no entendimento.
   - Destaque pontos importantes, cuidados comuns ou erros frequentes quando forem relevantes.
   - Finalize com um breve resumo dos pontos essenciais.
2. O texto "### [FLASHCARDS]".
3. Um JSON válido com pelo menos 5 flashcards para revisão, usando exatamente as chaves "question" e "answer".
   O JSON deve ser um array com no mínimo 5 objetos, cada objeto contendo uma pergunta e uma resposta.
   As perguntas devem revisar os conceitos mais importantes da explicação.
   As respostas devem ser claras, objetivas e úteis para memorização.

Mantenha a explicação acessível para estudantes, mas não seja superficial.
Evite exemplos de código muito extensos, a menos que solicitado.
Não inclua texto extra depois do JSON e não envolva o JSON em blocos de código Markdown.`, disciplina, assunto, pergunta)
}
