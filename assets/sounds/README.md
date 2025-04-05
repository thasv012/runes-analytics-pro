# Arquivos de Som para RUNES Analytics Pro

Esta pasta contém os efeitos sonoros utilizados pelo RUNES Analytics Pro.

## Lista de Arquivos Necessários

Por favor, adicione os seguintes arquivos de som nesta pasta:

1. `notification.mp3` - Som curto para notificações gerais
2. `achievement.mp3` - Som de conquista desbloqueada (mais entusiasmado)
3. `level-up.mp3` - Som de subida de nível (fanfarra)
4. `click.mp3` - Som suave para cliques em botões e navegação
5. `alert.mp3` - Som de alerta para notificações importantes
6. `whale-alert.mp3` - Som distinto para alertas de transações de baleias
7. `success.mp3` - Som positivo para ações bem-sucedidas
8. `error.mp3` - Som de erro ou falha
9. `trading.mp3` - Som de transação ou negociação

## Recomendações

- Todos os sons devem ser curtos (menos de 2 segundos)
- Formatos recomendados: MP3 ou OGG (por compatibilidade com navegadores)
- Evite sons muito altos ou irritantes
- Mantenha os arquivos pequenos para não afetar o desempenho

## Fontes Sugeridas

Você pode encontrar sons gratuitos ou de baixo custo em:

- [Freesound.org](https://freesound.org)
- [Zapsplat](https://www.zapsplat.com)
- [Mixkit](https://mixkit.co/free-sound-effects/)
- [SoundBible](https://soundbible.com)

## Uso na Aplicação

Os sons são gerenciados pelo componente `SoundManager` e são acionados para diversos eventos na aplicação, como:

- Navegação entre seções
- Conquistas desbloqueadas
- Subida de nível
- Alertas de transações de baleias
- Notificações importantes

Você pode ajustar o volume ou desativar os sons usando o controle de áudio na interface. 