import { Injectable } from '@nestjs/common';
import { SequenceRole } from '@prisma/client';

type SequencedCandidate = {
  sequenceRole: SequenceRole;
  durationSec: number;
};

@Injectable()
export class PlaylistSelectionService {
  selectByRole<T extends SequencedCandidate>(
    candidates: T[],
    targetDurationSec: number,
  ): { items: T[]; totalDurationSec: number } {
    const items: T[] = [];
    let totalDurationSec = 0;

    const mandatory = candidates.filter((item) => item.sequenceRole === SequenceRole.MANDATORY);
    const adjustable = candidates.filter((item) => item.sequenceRole === SequenceRole.ADJUSTABLE);
    const optional = candidates.filter((item) => item.sequenceRole === SequenceRole.OPTIONAL);

    mandatory.forEach((item) => {
      items.push(item);
      totalDurationSec += item.durationSec;
    });

    const addIfFits = (item: T) => {
      if (totalDurationSec + item.durationSec <= targetDurationSec) {
        items.push(item);
        totalDurationSec += item.durationSec;
      }
    };

    adjustable.forEach(addIfFits);
    optional.forEach(addIfFits);

    return { items, totalDurationSec };
  }
}
