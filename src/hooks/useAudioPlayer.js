import { useRef, useState } from "react";
import * as Tone from "tone";
import { tracks, notes, defaultVolume } from "../constants/music";

export function useAudioPlayer(addLog) {
  const [currentNote, setCurrentNote] = useState(null);
  const [volumes, setVolumes] = useState(() => {
    const initVolumes = {};
    tracks.forEach((t) => {
      initVolumes[t.base] = defaultVolume;
    });
    return initVolumes;
  });
  const [muted, setMuted] = useState(() => {
    const initMuted = {};
    tracks.forEach((t) => {
      initMuted[t.base] = true;
    });
    return initMuted;
  });

  const playerRefs = useRef({});
  const volumesRef = useRef(volumes);
  const mutedRef = useRef(muted);
  const transport = Tone.getTransport();

  const FADE_TIME = 0.5;

  // Tempo de fade para ações iniciadas pelo usuário (start/stop/mute/unmute)
  const USER_FADE_TIME = 4;

  // Mantém as refs atualizadas
  volumesRef.current = volumes;
  mutedRef.current = muted;

  const crossFade = async (file, baseVolume, track, semitoneOffset = 0, initialFade = FADE_TIME) => {
    const playerA = new Tone.Player({
      url: file,
      loop: true,
      autostart: false,
      volume: -Infinity,
    }).toDestination();
    
    const playerB = new Tone.Player({
      url: file,
      loop: true,
      autostart: false,
      volume: -Infinity,
    }).toDestination();

    await Promise.all([playerA.load(file), playerB.load(file)]);

    // Aplica transposição via playbackRate (2^(semitones/12)).
    const playbackRate = Math.pow(2, semitoneOffset / 12);
    try {
      playerA.playbackRate = playbackRate;
      playerB.playbackRate = playbackRate;
    } catch (e) {
      // Dependendo da versão do Tone, a propriedade pode ser diferente. Tentativa alternativa:
      if (playerA.playbackRate && playerA.playbackRate.value !== undefined) {
        playerA.playbackRate.value = playbackRate;
        playerB.playbackRate.value = playbackRate;
      }
    }

    // Começam silenciosos; aplicaremos um fade-in inicial quando for necessário
    try {
      playerA.volume.value = -Infinity;
    } catch (e) {}
    try {
      playerB.volume.value = -Infinity;
    } catch (e) {}

    // Ajusta duração do loop com base no playbackRate
    const duration = playerA.buffer.duration / (playbackRate || 1);
    let current = playerA;
    let next = playerB;

    const startAt = transport.seconds + 0.2;
    
    function scheduleNext(startTime) {
      const crossfadeStart = startTime + duration - FADE_TIME;
      current.start(startTime);

      transport.scheduleOnce(async (time) => {
        if (!next.buffer.loaded) return;

        // Obtém o volume atual no momento do loop
        const currentVolume = mutedRef.current[track.base] ? 0 : volumesRef.current[track.base] ?? defaultVolume;

        // start next exactly at the scheduled time provided by the transport callback
        next.start(time);
        next.volume.cancelAndHoldAtTime(time);
        current.volume.cancelAndHoldAtTime(time);

        next.volume.linearRampTo(Tone.gainToDb(currentVolume), FADE_TIME);
        current.volume.linearRampTo(-Infinity, FADE_TIME);

        [current, next] = [next, current];
        scheduleNext(time);
      }, crossfadeStart);
    }

    scheduleNext(startAt);

    // Aplica um fade-in inicial ao player atual quando ele começar (ação do usuário)
    try {
      transport.scheduleOnce((time) => {
        try {
          current.volume.cancelAndHoldAtTime(time);
        } catch (e) {}
        try {
          current.volume.linearRampTo(Tone.gainToDb(baseVolume), initialFade);
        } catch (e) {}
      }, startAt);
    } catch (e) {
      // fallback imediato
      try {
        current.volume.linearRampTo(Tone.gainToDb(baseVolume), initialFade);
      } catch (err) {}
    }

    playerRefs.current[track.base] = { playerA, playerB };
  };

    // Faz fade out e remove players fornecidos (aceita um map ou array de refs)
    const fadeOutAndDispose = (refsCollection, fadeDuration = USER_FADE_TIME) => {
      const refsArray = Array.isArray(refsCollection)
        ? refsCollection
        : Object.values(refsCollection || {});

      if (refsArray.length === 0) return Promise.resolve();

      refsArray.forEach(({ playerA, playerB }) => {
        try {
          playerA.volume.cancelAndHoldAtTime(Tone.now());
          playerA.volume.linearRampTo(-Infinity, fadeDuration);
        } catch (e) {}
        try {
          playerB.volume.cancelAndHoldAtTime(Tone.now());
          playerB.volume.linearRampTo(-Infinity, fadeDuration);
        } catch (e) {}
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          refsArray.forEach(({ playerA, playerB }) => {
            try {
              playerA.stop();
            } catch (e) {}
            try {
              playerB.stop();
            } catch (e) {}
            try {
              playerA.dispose?.();
            } catch (e) {}
            try {
              playerB.dispose?.();
            } catch (e) {}
          });
          resolve();
        }, Math.round(fadeDuration * 1000) + 50);
      });
    };

  const stopAll = async (opts = { fadeDuration: USER_FADE_TIME, clearNote: true }) => {
    const fadeDuration = opts.fadeDuration ?? USER_FADE_TIME;
    const clearNote = opts.clearNote ?? true;
    addLog?.("Parando todas as faixas", "warning");

    const refsMap = { ...playerRefs.current };
    const refsArr = Object.values(refsMap);
    if (refsArr.length === 0) {
      transport.stop();
      transport.cancel(0);
      playerRefs.current = {};
      if (clearNote && currentNote !== null) {
        setCurrentNote(null);
        addLog?.("Nota desmarcada", "info");
      }
      return;
    }

    // Faz fade out e dispose de todos os players atuais
    await fadeOutAndDispose(refsArr, fadeDuration);

    // Limpa o registry que pode ter sido parcialmente sobrescrito por novos players
    // Removemos apenas as referências que ainda apontavam para os players antigos
    Object.keys(refsMap).forEach((k) => {
      const existing = playerRefs.current[k];
      // se a referência atual é a mesma que a antiga, remove
      if (existing && (existing.playerA === refsMap[k].playerA || existing.playerB === refsMap[k].playerB)) {
        delete playerRefs.current[k];
      }
    });

    transport.stop();
    transport.cancel(0);
    if (clearNote && currentNote !== null) {
      setCurrentNote(null);
      addLog?.("Nota desmarcada", "info");
    }
  };

  const handleNoteClick = async (noteKey, semitone) => {
    console.log(noteKey);

    const newNote = currentNote === noteKey ? null : noteKey;
    setCurrentNote(newNote);

    // Se estamos apenas parando a reprodução (clicou na mesma nota para desligar)
    if (!newNote) {
      await stopAll({ clearNote: true });
      addLog?.("Reprodução parada", "info");
      return;
    }

    const isSwitch = currentNote && currentNote !== newNote;

    // Captura os players atuais para fazermos fade out depois (se for troca)
    const oldRefsMap = isSwitch ? { ...playerRefs.current } : null;

    addLog?.(`Nota selecionada: ${noteKey}`, "success");

    // Reinicia o transport para o início e garante que ele esteja STARTED
    transport.seconds = 0;
    if (transport.state !== "started") {
      transport.start();
      addLog?.("Transport iniciado", "success");
    }

    for (const track of tracks) {
      // Vamos carregar sempre a nota C e transpor para a nota desejada
      const baseFile = `/pads/${track.base}.mp3`;
  const baseVolume = muted[track.base] ? 0 : volumes[track.base] ?? defaultVolume;
      // Se a faixa está mutada, não carregamos nem iniciamos o crossfade
      const isMuted = muted[track.base] ?? mutedRef.current[track.base];
      if (isMuted) {
        addLog?.(`Pulado carregamento de ${track.name} porque está mutado`, "info");
        continue;
      }

      addLog?.(`Carregando (transpondo a partir de C): ${track.name} -> ${newNote} (${semitone} semitons)`, "info");

      // crossFade agora aceita um terceiro parâmetro "semitone" opcional via closure
      // implementamos carregamento tentando primeiro o C e, em caso de falha, usar o arquivo da nota direta
      const tryLoadAndCrossfade = async () => {
        try {
          // Ao iniciar por ação do usuário, pedimos um fade-in maior
          await crossFade(baseFile, baseVolume, track, semitone, USER_FADE_TIME);
        } catch (err) {
          addLog?.(`Erro ao carregar amostra para ${track.name}: ${err?.message ?? err}`, "error");
        }
      };

      tryLoadAndCrossfade();
    }

    // Se for troca de nota: após iniciar novos players, faz fade out e remove os antigos
    if (isSwitch && oldRefsMap) {
      // aguarda um pequeno delay para garantir que os novos players foram criados e registrados
      setTimeout(() => {
        // fade out os refs antigos sem afetar as novas referências
        fadeOutAndDispose(Object.values(oldRefsMap), USER_FADE_TIME).then(() => {
          // remove as chaves antigas que ainda apontem para os players antigos
          Object.keys(oldRefsMap).forEach((k) => {
            const existing = playerRefs.current[k];
            if (existing && (existing.playerA === oldRefsMap[k].playerA || existing.playerB === oldRefsMap[k].playerB)) {
              delete playerRefs.current[k];
            }
          });
        });
      }, 50);
    }

    // transport já iniciado acima
  };

  const handleVolumeChange = (trackId, newVolume, trackName) => {
    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    addLog?.(`Volume de ${trackName}: ${Math.round(newVolume * 100)}%`, "info");
    
    const refs = playerRefs.current[trackId];
    if (refs && !muted[trackId]) {
      refs.playerA.volume.value = Tone.gainToDb(newVolume);
      refs.playerB.volume.value = Tone.gainToDb(newVolume);
    }
  };

  const toggleMute = (trackId, trackName) => {
    // Determina novo estado de mute a partir do estado atual
    const newMuted = !muted[trackId];

    // Atualiza estado React e a ref de forma determinística
    setMuted((prev) => ({ ...prev, [trackId]: newMuted }));
    mutedRef.current = { ...mutedRef.current, [trackId]: newMuted };

    addLog?.(`${trackName}: ${newMuted ? "Mutado" : "Desmutado"}`, "info");

    const refs = playerRefs.current[trackId];

    if (newMuted) {
      // Ao mutar: se existirem players, faz fade out e descarta após o fade
      if (refs) {
        try {
          refs.playerA.volume.cancelAndHoldAtTime(Tone.now());
          refs.playerA.volume.linearRampTo(-Infinity, USER_FADE_TIME);
        } catch (e) {}
        try {
          refs.playerB.volume.cancelAndHoldAtTime(Tone.now());
          refs.playerB.volume.linearRampTo(-Infinity, USER_FADE_TIME);
        } catch (e) {}

        setTimeout(() => {
          try {
            refs.playerA.stop();
          } catch (e) {}
          try {
            refs.playerB.stop();
          } catch (e) {}
          try {
            refs.playerA.dispose?.();
          } catch (e) {}
          try {
            refs.playerB.dispose?.();
          } catch (e) {}
          delete playerRefs.current[trackId];
        }, Math.round(USER_FADE_TIME * 1000) + 50);
      }
      addLog?.(`${trackName}: áudio descarregado`, "info");
      return;
    }

    // Ao desmutar:
    // - Se já temos players, apenas restaura o volume.
    // - Se não temos players e o transport está tocando com uma nota selecionada, recarrega a amostra.
    if (refs) {
      const newVol = volumes[trackId] ?? defaultVolume;
      try {
        refs.playerA.volume.cancelAndHoldAtTime(Tone.now());
        refs.playerA.volume.linearRampTo(Tone.gainToDb(newVol), USER_FADE_TIME);
      } catch (e) {}
      try {
        refs.playerB.volume.cancelAndHoldAtTime(Tone.now());
        refs.playerB.volume.linearRampTo(Tone.gainToDb(newVol), USER_FADE_TIME);
      } catch (e) {}
      return;
    }

    // Não há players; se estivermos em reprodução, recria a faixa
    if (transport.state === "started" && currentNote) {
      const track = tracks.find((t) => t.base === trackId);
      if (!track) return;

      const noteObj = notes.find((n) => n.key === currentNote);
      const semitone = noteObj ? noteObj.semitone : 0;
      const baseFile = `/pads/${track.base}.mp3`;
      const baseVolume = volumes[trackId] ?? defaultVolume;

      addLog?.(`${trackName}: recarregando áudio após desmutar`, "info");
      (async () => {
        try {
          await crossFade(baseFile, baseVolume, track, semitone, USER_FADE_TIME);
        } catch (err) {
          addLog?.(`Erro ao recarregar amostra para ${track.name}: ${err?.message ?? err}`, "error");
        }
      })();
    }
  };

  return {
    currentNote,
    volumes,
    muted,
    handleNoteClick,
    handleVolumeChange,
    toggleMute,
    stopAll,
    // Permite que o componente pai desmarque a nota imediatamente antes de outras ações
    deselectNote: () => {
      if (currentNote !== null) {
        setCurrentNote(null);
        addLog?.("Nota desmarcada", "info");
      }
    },
  };
}
